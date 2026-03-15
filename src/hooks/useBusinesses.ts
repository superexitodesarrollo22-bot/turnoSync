import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export const useBusinesses = (query = '') => {
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBusinesses = async () => {
        setLoading(true);
        setError(null);
        try {
            let q = supabase
                .from('businesses')
                .select(
                    'id, name, slug, description, address, phone, whatsapp, logo_url, timezone, active'
                )
                .eq('active', true)
                .order('name', { ascending: true });

            if (query.trim().length >= 2) {
                q = q.ilike('name', `%${query.trim()}%`);
            }

            const { data, error: supabaseError } = await q;

            if (supabaseError) {
                setError(supabaseError.message);
                setBusinesses([]);
            } else {
                setBusinesses(data ?? []);
            }
        } catch (err: any) {
            setError(err.message);
            setBusinesses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchBusinesses, query ? 350 : 0);
        return () => clearTimeout(timer);
    }, [query]);

    return { businesses, loading, error, refetch: fetchBusinesses };
};
