import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export const useBusinessDetail = (businessId: string) => {
    const [business, setBusiness] = useState<any>(null);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const [{ data: b, error: e1 }, { data: s, error: e2 }] = await Promise.all([
                    supabase.from('businesses').select('*').eq('id', businessId).single(),
                    supabase.from('services').select('*').eq('business_id', businessId).eq('active', true),
                ]);
                if (e1 || e2) throw e1 || e2;
                setBusiness(b);
                setServices(s ?? []);
            } catch (err) {
                console.error('[useBusinessDetail] Error fetching business details:', err);
                setBusiness(null);
                setServices([]);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [businessId]);

    return { business, services, loading };
};
