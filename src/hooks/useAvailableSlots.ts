import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useAvailableSlots = (businessId: string, date: string) => {
    const [slots, setSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!date) return;
        const fetch = async () => {
            setLoading(true);
            try {
                const dayOfWeek = new Date(date).getDay();

                const [{ data: schedule, error: e1 }, { data: appointments, error: e2 }, { data: blackout, error: e3 }] = await Promise.all([
                    supabase.from('schedules').select('*').eq('business_id', businessId).eq('weekday', dayOfWeek).single(),
                    supabase.from('appointments').select('start_at, end_at').eq('business_id', businessId).gte('start_at', `${date}T00:00:00`).lte('start_at', `${date}T23:59:59`).not('status', 'in', '(cancelled)'),
                    supabase.from('blackout_dates').select('date').eq('business_id', businessId).eq('date', date),
                ]);

                if (e1 || e2 || e3) throw e1 || e2 || e3;

                if (!schedule || (blackout && blackout.length > 0)) { setSlots([]); return; }

                const duration = 30;
                const start = schedule.start_time;
                const end = schedule.end_time;
                const takenSlots = (appointments ?? []).map((a: any) => a.start_at.substring(11, 16));

                const generated: string[] = [];
                let [h, m] = start.split(':').map(Number);
                const [eh, em] = end.split(':').map(Number);

                while (h * 60 + m + duration <= eh * 60 + em) {
                    const slotTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                    const slotDateTime = new Date(`${date}T${slotTime}:00`);
                    if (slotDateTime > new Date() && !takenSlots.includes(slotTime)) {
                        generated.push(slotTime);
                    }
                    m += duration;
                    if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
                }

                setSlots(generated);
            } catch (err) {
                console.error('[useAvailableSlots] Error fetching slots:', err);
                setSlots([]);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [businessId, date]);

    return { slots, loading };
};
