import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface UseAvailableSlotsParams {
    businessId: string;
    date: string;
    serviceId: string;
    staffId: string | null;
}

export const useAvailableSlots = ({ businessId, date, serviceId, staffId }: UseAvailableSlotsParams) => {
    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSlots = async () => {
        if (!businessId || !date || !serviceId) return;

        setLoading(true);
        setError(null);
        try {
            const { data, error: rpcError } = await supabase.rpc('get_available_slots', {
                p_business_id: businessId,
                p_date: date,
                p_service_id: serviceId,
                p_staff_id: staffId,
            });

            if (rpcError) throw rpcError;

            // Agrupar por staff_id
            const groupedStaff = data.reduce((acc: any, slot: any) => {
                const existingStaff = acc.find((s: any) => s.staffId === slot.staff_id);
                if (existingStaff) {
                    existingStaff.slots.push({
                        slot_start: slot.slot_start,
                        slot_end: slot.slot_end,
                        label: new Date(slot.slot_start).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        })
                    });
                } else {
                    acc.push({
                        staffId: slot.staff_id,
                        staffName: slot.staff_name,
                        slots: [{
                            slot_start: slot.slot_start,
                            slot_end: slot.slot_end,
                            label: new Date(slot.slot_start).toLocaleTimeString('es-AR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            })
                        }]
                    });
                }
                return acc;
            }, []);

            setSlots(groupedStaff);
        } catch (e: any) {
            console.error('[useAvailableSlots] Error:', e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, [businessId, date, serviceId, staffId]);

    return { slots, loading, error, refetch: fetchSlots };
};
