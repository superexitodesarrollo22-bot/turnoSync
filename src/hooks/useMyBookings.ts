import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useMyBookings = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = async () => {
        setLoading(true);
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw authError || new Error('No user found');

            const { data: userData, error: userError } = await supabase.from('users').select('id').eq('supabase_auth_uid', user.id).single();
            if (userError || !userData) throw userError || new Error('User data not found');

            const { data, error } = await supabase
                .from('appointments')
                .select('*, businesses(name, address), services(name, price_cents, duration_minutes)')
                .eq('client_user_id', userData.id)
                .order('start_at', { ascending: false });

            if (error) throw error;
            setBookings(data ?? []);
        } catch (err) {
            console.error('[useMyBookings] Error fetching bookings:', err);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetch(); }, []);

    const cancelBooking = async (appointmentId: string) => {
        await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', appointmentId);
        await fetch();
    };

    return { bookings, loading, cancelBooking, refresh: fetch };
};
