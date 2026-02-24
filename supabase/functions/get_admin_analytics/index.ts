// ============================================================
// TurnoSync Edge Function: get_admin_analytics
// Returns KPI aggregations for a business.
// ============================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
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

        const { business_id, period = 'month' } = await req.json();
        if (!business_id) {
            return errorResponse('INVALID_PAYLOAD', 'Missing business_id', 400);
        }

        // Verify admin access
        const { data: userData } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('supabase_auth_uid', authUser.id)
            .single();

        const { data: businessUser } = await supabaseAdmin
            .from('business_users')
            .select('role')
            .eq('business_id', business_id)
            .eq('user_id', userData?.id)
            .maybeSingle();

        if (!businessUser) {
            return errorResponse('FORBIDDEN', 'Not a member of this business', 403);
        }

        // ── Date ranges ──────────────────────────────────────
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

        let periodStart: string;
        if (period === 'today') {
            periodStart = todayStart;
        } else if (period === 'week') {
            const d = new Date(now);
            d.setDate(d.getDate() - 7);
            periodStart = d.toISOString();
        } else {
            // month
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        }

        // ── KPI Queries (parallel) ───────────────────────────
        const [
            todayAppointments,
            periodRevenue,
            noShows,
            newClients,
            topServices,
        ] = await Promise.all([
            // Today's appointments
            supabaseAdmin
                .from('appointments')
                .select('id, status', { count: 'exact' })
                .eq('business_id', business_id)
                .gte('start_at', todayStart)
                .lt('start_at', todayEnd),

            // Period revenue (confirmed + completed)
            supabaseAdmin
                .from('appointments')
                .select('price_cents')
                .eq('business_id', business_id)
                .in('status', ['confirmed', 'completed'])
                .gte('start_at', periodStart),

            // No-shows in period
            supabaseAdmin
                .from('appointments')
                .select('id', { count: 'exact' })
                .eq('business_id', business_id)
                .eq('status', 'no_show')
                .gte('start_at', periodStart),

            // New unique clients in period
            supabaseAdmin
                .from('appointments')
                .select('client_user_id')
                .eq('business_id', business_id)
                .gte('created_at', periodStart),

            // Top services
            supabaseAdmin
                .from('appointments')
                .select('service_id, services(name)')
                .eq('business_id', business_id)
                .gte('start_at', periodStart)
                .not('status', 'in', '("cancelled","no_show")'),
        ]);

        // Aggregate revenue
        const totalRevenueCents = (periodRevenue.data ?? []).reduce(
            (sum: number, a: { price_cents: number }) => sum + (a.price_cents ?? 0),
            0
        );

        // Unique clients
        const uniqueClientIds = new Set(
            (newClients.data ?? []).map((a: { client_user_id: string }) => a.client_user_id)
        );

        // Top services aggregation
        const serviceCount: Record<string, { name: string; count: number }> = {};
        for (const appt of topServices.data ?? []) {
            const svc = appt as { service_id: string; services: { name: string } | null };
            if (!serviceCount[svc.service_id]) {
                serviceCount[svc.service_id] = {
                    name: svc.services?.name ?? 'Unknown',
                    count: 0,
                };
            }
            serviceCount[svc.service_id].count++;
        }
        const topServicesArr = Object.entries(serviceCount)
            .map(([id, v]) => ({ service_id: id, ...v }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return new Response(
            JSON.stringify({
                data: {
                    today_appointments: todayAppointments.count ?? 0,
                    total_revenue_cents: totalRevenueCents,
                    no_shows: noShows.count ?? 0,
                    new_clients: uniqueClientIds.size,
                    top_services: topServicesArr,
                    period,
                },
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } catch (err) {
        console.error('[get_admin_analytics] Error:', err);
        return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
    }
});

function errorResponse(code: string, message: string, status: number) {
    return new Response(
        JSON.stringify({ error: { code, message } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status }
    );
}
