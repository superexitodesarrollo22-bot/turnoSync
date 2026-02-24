// ============================================================
// TurnoSync Edge Function: update_appointment_status
// Validates role/ownership and updates appointment status.
// ============================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

const VALID_STATUSES: AppointmentStatus[] = [
    'pending', 'confirmed', 'cancelled', 'completed', 'no_show',
];

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // ── 1. Auth ─────────────────────────────────────────
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

        // ── 2. Parse payload ─────────────────────────────────
        const { appointment_id, status } = await req.json();

        if (!appointment_id || !status) {
            return errorResponse('INVALID_PAYLOAD', 'Missing appointment_id or status', 400);
        }

        if (!VALID_STATUSES.includes(status)) {
            return errorResponse('INVALID_STATUS', `Status must be one of: ${VALID_STATUSES.join(', ')}`, 400);
        }

        // ── 3. Fetch appointment ─────────────────────────────
        const { data: appointment, error: fetchError } = await supabaseAdmin
            .from('appointments')
            .select('id, business_id, client_user_id, status, start_at')
            .eq('id', appointment_id)
            .single();

        if (fetchError || !appointment) {
            return errorResponse('NOT_FOUND', 'Appointment not found', 404);
        }

        // ── 4. Get internal user id ──────────────────────────
        const { data: userData } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('supabase_auth_uid', authUser.id)
            .single();

        if (!userData?.id) {
            return errorResponse('USER_NOT_FOUND', 'User profile not found', 404);
        }

        // ── 5. Authorization check ───────────────────────────
        const isOwner = appointment.client_user_id === userData.id;

        const { data: businessUser } = await supabaseAdmin
            .from('business_users')
            .select('role')
            .eq('business_id', appointment.business_id)
            .eq('user_id', userData.id)
            .maybeSingle();

        const isAdmin = businessUser?.role === 'owner' || businessUser?.role === 'admin';

        // Clients can only cancel their own appointments
        if (!isAdmin && !isOwner) {
            return errorResponse('FORBIDDEN', 'Not authorized to update this appointment', 403);
        }

        if (!isAdmin && status !== 'cancelled') {
            return errorResponse('FORBIDDEN', 'Clients can only cancel appointments', 403);
        }

        // ── 6. Business logic guards ─────────────────────────
        if (appointment.status === 'completed') {
            return errorResponse('INVALID_TRANSITION', 'Cannot update a completed appointment', 409);
        }

        if (appointment.status === 'cancelled' && status !== 'pending') {
            return errorResponse('INVALID_TRANSITION', 'Cannot reactivate a cancelled appointment', 409);
        }

        // ── 7. Update status ─────────────────────────────────
        const { data: updated, error: updateError } = await supabaseAdmin
            .from('appointments')
            .update({ status })
            .eq('id', appointment_id)
            .select()
            .single();

        if (updateError) {
            return errorResponse('UPDATE_FAILED', 'Failed to update appointment', 500);
        }

        // ── 8. Audit log ─────────────────────────────────────
        await supabaseAdmin.from('audit_logs').insert({
            business_id: appointment.business_id,
            user_id: userData.id,
            action: 'appointment.status_updated',
            metadata: {
                appointment_id,
                old_status: appointment.status,
                new_status: status,
                updated_by_role: isAdmin ? businessUser?.role : 'client',
            },
        });

        // ── 9. Push notification to client ───────────────────
        const statusMessages: Record<string, string> = {
            confirmed: '✅ Tu reserva fue confirmada',
            cancelled: '❌ Tu reserva fue cancelada',
            completed: '🎉 ¡Servicio completado!',
            no_show: '⚠️ Marcado como no presentado',
        };

        if (statusMessages[status] && isAdmin) {
            // Notify the client
            sendPushNotification(supabaseAdmin, appointment.client_user_id, {
                title: statusMessages[status],
                body: `Cita del ${new Date(appointment.start_at).toLocaleString('es-EC')}`,
                data: { appointment_id },
            }).catch(console.error);
        }

        return new Response(JSON.stringify({ data: updated }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (err) {
        console.error('[update_appointment_status] Error:', err);
        return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
    }
});

function errorResponse(code: string, message: string, status: number) {
    return new Response(
        JSON.stringify({ error: { code, message } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status }
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

    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
            devices.map((d: { expo_push_token: string }) => ({
                to: d.expo_push_token,
                sound: 'default',
                title: notification.title,
                body: notification.body,
                data: notification.data ?? {},
            }))
        ),
    });
}
