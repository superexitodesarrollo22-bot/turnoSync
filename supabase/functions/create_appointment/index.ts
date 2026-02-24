// ============================================================
// TurnoSync Edge Function: create_appointment
// Validates and creates a new appointment transactionally.
// ============================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateAppointmentPayload {
    business_id: string;
    service_id: string;
    staff_id?: string;
    requested_start_at: string; // ISO 8601 UTC
}

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // ── 1. Auth validation ──────────────────────────────
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return errorResponse('UNAUTHORIZED', 'Missing Authorization header', 401);
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
        if (authError || !authUser) {
            return errorResponse('UNAUTHORIZED', 'Invalid token', 401);
        }

        // ── 2. Parse & validate payload ─────────────────────
        const payload: CreateAppointmentPayload = await req.json();
        const { business_id, service_id, staff_id, requested_start_at } = payload;

        if (!business_id || !service_id || !requested_start_at) {
            return errorResponse('INVALID_PAYLOAD', 'Missing required fields', 400);
        }

        const startAt = new Date(requested_start_at);
        if (isNaN(startAt.getTime())) {
            return errorResponse('INVALID_PAYLOAD', 'Invalid requested_start_at', 400);
        }

        // ── 3. Fetch service (duration + price) ─────────────
        const { data: service, error: serviceError } = await supabaseAdmin
            .from('services')
            .select('id, duration_minutes, price_cents, active, business_id')
            .eq('id', service_id)
            .eq('business_id', business_id)
            .single();

        if (serviceError || !service || !service.active) {
            return errorResponse('INVALID_SERVICE', 'Service not found or inactive', 404);
        }

        const endAt = new Date(startAt.getTime() + service.duration_minutes * 60 * 1000);

        // ── 4. Fetch business timezone ───────────────────────
        const { data: business } = await supabaseAdmin
            .from('businesses')
            .select('timezone, active')
            .eq('id', business_id)
            .single();

        if (!business?.active) {
            return errorResponse('INVALID_BUSINESS', 'Business not found or inactive', 404);
        }

        // ── 5. Check blackout dates ──────────────────────────
        const dateStr = startAt.toISOString().split('T')[0]; // YYYY-MM-DD UTC
        const { data: blackout } = await supabaseAdmin
            .from('blackout_dates')
            .select('id')
            .eq('business_id', business_id)
            .eq('date', dateStr)
            .maybeSingle();

        if (blackout) {
            return errorResponse('BLACKOUT', 'This date is blocked', 409);
        }

        // ── 6. Check business schedule ───────────────────────
        const weekday = startAt.getUTCDay(); // 0=Sun
        const { data: schedules } = await supabaseAdmin
            .from('schedules')
            .select('start_time, end_time')
            .eq('business_id', business_id)
            .eq('weekday', weekday);

        if (!schedules || schedules.length === 0) {
            return errorResponse('OUT_OF_HOURS', 'Business is closed on this day', 409);
        }

        // Check if startAt and endAt fall within any schedule window
        const startTimeStr = startAt.toISOString().substring(11, 19); // HH:MM:SS
        const endTimeStr = endAt.toISOString().substring(11, 19);

        const withinSchedule = schedules.some((s: { start_time: string; end_time: string }) =>
            startTimeStr >= s.start_time && endTimeStr <= s.end_time
        );

        if (!withinSchedule) {
            return errorResponse('OUT_OF_HOURS', 'Appointment falls outside business hours', 409);
        }

        // ── 7. Check overlapping appointments ───────────────
        let overlapQuery = supabaseAdmin
            .from('appointments')
            .select('id')
            .eq('business_id', business_id)
            .not('status', 'in', '("cancelled","no_show")')
            .lt('start_at', endAt.toISOString())
            .gt('end_at', startAt.toISOString());

        if (staff_id) {
            overlapQuery = overlapQuery.eq('staff_id', staff_id);
        }

        const { data: overlapping } = await overlapQuery;

        if (overlapping && overlapping.length > 0) {
            return errorResponse('CONFLICT', 'Time slot is already booked', 409);
        }

        // ── 8. Get internal user id ──────────────────────────
        const { data: userData } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('supabase_auth_uid', authUser.id)
            .single();

        if (!userData?.id) {
            return errorResponse('USER_NOT_FOUND', 'User profile not found', 404);
        }

        // ── 9. Insert appointment ────────────────────────────
        const { data: appointment, error: insertError } = await supabaseAdmin
            .from('appointments')
            .insert({
                business_id,
                client_user_id: userData.id,
                service_id,
                staff_id: staff_id ?? null,
                start_at: startAt.toISOString(),
                end_at: endAt.toISOString(),
                status: 'pending',
                price_cents: service.price_cents,
            })
            .select()
            .single();

        if (insertError) {
            console.error('[create_appointment] Insert error:', insertError);
            return errorResponse('INSERT_FAILED', 'Failed to create appointment', 500);
        }

        // ── 10. Write audit log ──────────────────────────────
        await supabaseAdmin.from('audit_logs').insert({
            business_id,
            user_id: userData.id,
            action: 'appointment.created',
            metadata: {
                appointment_id: appointment.id,
                service_id,
                staff_id,
                start_at: startAt.toISOString(),
            },
        });

        // ── 11. Send push notification (fire & forget) ───────
        sendPushNotification(supabaseAdmin, userData.id, {
            title: '✅ Reserva confirmada',
            body: `Tu cita está programada para ${startAt.toLocaleString('es-EC')}`,
            data: { appointment_id: appointment.id },
        }).catch(console.error);

        return new Response(JSON.stringify({ data: appointment }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 201,
        });
    } catch (err) {
        console.error('[create_appointment] Unhandled error:', err);
        return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
    }
});

// ─── Helpers ─────────────────────────────────────────────────

function errorResponse(code: string, message: string, status: number) {
    return new Response(
        JSON.stringify({ error: { code, message } }),
        {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status,
        }
    );
}

async function sendPushNotification(
    supabase: ReturnType<typeof createClient>,
    userId: string,
    notification: { title: string; body: string; data?: Record<string, unknown> }
) {
    const { data: devices } = await supabase
        .from('user_devices')
        .select('expo_push_token')
        .eq('user_id', userId);

    if (!devices || devices.length === 0) return;

    const messages = devices.map((d: { expo_push_token: string }) => ({
        to: d.expo_push_token,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data ?? {},
    }));

    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messages),
    });
}
