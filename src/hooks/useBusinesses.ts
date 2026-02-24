import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useBusinesses = (query = '') => {
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                let q = supabase.from('businesses').select('*').eq('active', true);
                if (query.trim().length >= 2) q = q.ilike('name', `%${query}%`);
                const { data, error } = await q;
                if (error) throw error;
                setBusinesses(data ?? []);
            } catch (err) {
                console.error('[useBusinesses] Error fetching businesses:', err);
                setBusinesses([]);
            } finally {
                setLoading(false);
            }
        };
        const timer = setTimeout(fetch, query ? 350 : 0);
        return () => clearTimeout(timer);
    }, [query]);

    return { businesses, loading };
};
