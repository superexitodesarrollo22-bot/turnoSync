import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useMyAppointments = (filter: 'upcoming' | 'past' | 'cancelled' = 'upcoming') => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            let query = supabase
                .from('appointments')
                .select(`
                    id,
                    start_at,
                    end_at,
                    status,
                    notes,
                    price_cents,
                    services ( name, duration_minutes, price_cents ),
                    staff    ( name, photo_url ),
                    businesses ( name, address, phone, logo_url )
                `);

            const now = new Date().toISOString();

            if (filter === 'upcoming') {
                query = query.gte('start_at', now).neq('status', 'cancelled');
            } else if (filter === 'past') {
                query = query.lt('start_at', now);
            } else if (filter === 'cancelled') {
                query = query.eq('status', 'cancelled');
            }

            const { data, error: queryError } = await query.order('start_at', { ascending: filter !== 'past' });

            if (queryError) throw queryError;
            setAppointments(data ?? []);
        } catch (e: any) {
            console.error('[useMyAppointments] Error:', e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [filter]);

    const cancelAppointment = async (appointmentId: string) => {
        try {
            const { error: cancelError } = await supabase.rpc('cancel_appointment', { p_appointment_id: appointmentId });
            if (cancelError) throw cancelError;
            await fetchAppointments();
            return true;
        } catch (e: any) {
            console.error('[useMyAppointments] Cancel Error:', e);
            return false;
        }
    };

    return { appointments, loading, error, refetch: fetchAppointments, cancelAppointment };
};
