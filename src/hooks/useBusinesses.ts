import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useBusinesses = (query = '') => {
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBusinesses = async () => {
            setLoading(true);
            setError(null);
            try {
                let q = supabase
                    .from('businesses')
                    .select('id, name, slug, description, address, phone, whatsapp, logo_url, timezone, active')
                    .order('name', { ascending: true });

                if (query.trim().length >= 2) {
                    q = q.ilike('name', `%${query.trim()}%`);
                }

                const { data, error: supabaseError } = await q;

                if (supabaseError) {
                    console.error('[useBusinesses] Supabase error:', supabaseError.message, supabaseError.code);
                    setError(supabaseError.message);
                    setBusinesses([]);
                } else {
                    console.log('[useBusinesses] Registros recibidos:', data?.length ?? 0);
                    setBusinesses(data ?? []);
                }
            } catch (err: any) {
                console.error('[useBusinesses] Exception:', err.message);
                setError(err.message);
                setBusinesses([]);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchBusinesses, query ? 350 : 0);
        return () => clearTimeout(timer);
    }, [query]);

    return { businesses, loading, error };
};
