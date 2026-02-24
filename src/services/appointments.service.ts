import { supabase } from '../config/supabase';
import { Appointment } from '../types';

// ─── Client-side appointment queries ─────────────────

/**
 * Fetch appointments for the current authenticated user.
 * Returns enriched objects with business, service, and staff info.
 */
export async function getMyAppointments(): Promise<any[]> {
    const {
        data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return [];

    // Get internal user id
    const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_auth_uid', authUser.id)
        .single();

    if (!userData?.id) return [];

    const { data, error } = await supabase
        .from('appointments')
        .select(`
            *,
            services(id, name, duration_minutes, price_cents),
            staff(id, name, photo_url),
            businesses(id, name, address, timezone, phone, whatsapp)
        `)
        .eq('client_user_id', userData.id)
        .order('start_at', { ascending: false });

    if (error) {
        console.error('[getMyAppointments]', error.message);
        return [];
    }
    return data ?? [];
}

// ─── Duplicate booking check ──────────────────────────

/**
 * Check if the user already has an active booking at this business on the same day.
 * Returns true if a duplicate exists.
 */
export async function hasActiveBookingOnDay(
    businessId: string,
    date: string
): Promise<boolean> {
    const {
        data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return false;

    const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_auth_uid', authUser.id)
        .single();

    if (!userData?.id) return false;

    const dayStart = `${date}T00:00:00`;
    const dayEnd = `${date}T23:59:59`;

    const { data } = await supabase
        .from('appointments')
        .select('id')
        .eq('business_id', businessId)
        .eq('client_user_id', userData.id)
        .gte('start_at', dayStart)
        .lte('start_at', dayEnd)
        .not('status', 'in', '("cancelled","completed")')
        .limit(1);

    return (data?.length ?? 0) > 0;
}

// ─── Slot conflict check ──────────────────────────────

/**
 * Check if a specific time slot is still available (no active booking within ±1 min).
 * Used as a race-condition guard just before confirming.
 */
export async function isSlotAvailable(
    businessId: string,
    startAt: string
): Promise<boolean> {
    const slotStart = new Date(startAt);
    const rangeStart = new Date(slotStart.getTime() - 60000).toISOString();
    const rangeEnd = new Date(slotStart.getTime() + 60000).toISOString();

    const { data } = await supabase
        .from('appointments')
        .select('id')
        .eq('business_id', businessId)
        .gte('start_at', rangeStart)
        .lte('start_at', rangeEnd)
        .not('status', 'in', '("cancelled","completed")')
        .limit(1);

    return (data?.length ?? 0) === 0;
}

// ─── Create Appointment ───────────────────────────────

/**
 * Create a booking. First checks for duplicates and slot conflicts,
 * then tries the RPC, falling back to direct insert.
 */
export async function createAppointment(payload: {
    business_id: string;
    service_id: string;
    staff_id?: string | undefined;
    requested_start_at: string;
}): Promise<{ data: Appointment | null; error: string | null }> {
    const {
        data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return { data: null, error: 'No estás autenticado' };

    // Get internal user
    const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_auth_uid', authUser.id)
        .single();
    if (!userData?.id) return { data: null, error: 'Usuario no encontrado' };

    // Check for duplicate booking on the same day at this business
    const dateStr = payload.requested_start_at.split('T')[0];
    const hasDuplicate = await hasActiveBookingOnDay(payload.business_id, dateStr);
    if (hasDuplicate) {
        return { data: null, error: 'Ya tienes un turno activo en esta barbería para este día.' };
    }

    // Check slot is still available (race condition guard)
    const slotFree = await isSlotAvailable(payload.business_id, payload.requested_start_at);
    if (!slotFree) {
        return { data: null, error: 'Este horario ya no está disponible. Por favor elige otro turno.' };
    }

    // Try RPC first
    try {
        const { data: result, error: rpcError } = await supabase.rpc('rpc_create_appointment', {
            p_business_id: payload.business_id,
            p_service_id: payload.service_id,
            p_staff_id: payload.staff_id || null,
            p_requested_start_at: payload.requested_start_at,
        });

        if (!rpcError && result && !result.error) {
            return { data: result.data as Appointment, error: null };
        }
        // RPC not found or failed — fall through to direct insert
    } catch {
        // RPC not available — use direct insert
    }

    // Fetch service to get duration
    const { data: service } = await supabase
        .from('services')
        .select('duration_minutes, price_cents')
        .eq('id', payload.service_id)
        .single();

    if (!service) {
        return { data: null, error: 'Servicio no encontrado' };
    }

    const startAt = new Date(payload.requested_start_at);
    const endAt = new Date(startAt.getTime() + service.duration_minutes * 60000);

    const { data: appt, error: insertError } = await supabase
        .from('appointments')
        .insert({
            business_id: payload.business_id,
            client_user_id: userData.id,
            service_id: payload.service_id,
            staff_id: payload.staff_id || null,
            start_at: startAt.toISOString(),
            end_at: endAt.toISOString(),
            status: 'pending',
            price_cents: service.price_cents,
        })
        .select(`
            *,
            services(id, name, duration_minutes, price_cents),
            staff(id, name),
            businesses(id, name, timezone)
        `)
        .single();

    if (insertError) {
        return { data: null, error: insertError.message };
    }

    return { data: appt as Appointment, error: null };
}

// ─── Cancel Appointment ───────────────────────────────

/**
 * Client cancels a booking. Returns error if within 48h of appointment.
 */
export async function cancelAppointment(
    appointmentId: string,
    startAt: string,
    timezone: string = 'America/Guayaquil'
): Promise<{ error: string | null }> {
    // 72-hour rule: compare now vs appointment time
    const now = new Date();
    const apptTime = new Date(startAt);
    const hoursUntil = (apptTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil < 72) {
        return {
            error: `No es posible cancelar con menos de 72 horas de anticipación.\nPor favor contacta directamente a la barbería.`,
        };
    }


    const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

    if (error) return { error: error.message };
    return { error: null };
}

/**
 * Update appointment status (used by admin panel and internal flows).
 */
export async function updateAppointmentStatus(
    appointmentId: string,
    status: Appointment['status']
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

    if (error) return { error: error.message };
    return { error: null };
}
