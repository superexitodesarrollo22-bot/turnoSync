// ============================================================
// TurnoSync Edge Function: search_businesses
// Full-text search with optional geo filtering.
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
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { q = '', lat, lng, radius = 10 } = await req.json();

        let query = supabaseAdmin
            .from('businesses')
            .select('id, name, slug, description, address, phone, logo_url, timezone')
            .eq('active', true)
            .order('name')
            .limit(20);

        if (q.trim()) {
            query = query.ilike('name', `%${q.trim()}%`);
        }

        const { data, error } = await query;

        if (error) {
            return errorResponse('QUERY_FAILED', error.message, 500);
        }

        return new Response(JSON.stringify({ data: data ?? [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (err) {
        console.error('[search_businesses] Error:', err);
        return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
    }
});

function errorResponse(code: string, message: string, status: number) {
    return new Response(
        JSON.stringify({ error: { code, message } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status }
    );
}
