import { useState } from 'react';
import { supabase } from '../config/supabase';

interface BookParams {
    businessId: string;
    serviceId: string;
    staffId: string;
    startAt: string;
    notes?: string;
}

export const useBookAppointment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const bookAppointment = async (params: BookParams) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: rpcError } = await supabase.rpc('book_appointment', {
                p_business_id: params.businessId,
                p_service_id: params.serviceId,
                p_staff_id: params.staffId,
                p_start_at: params.startAt,
                p_notes: params.notes || null,
            });

            if (rpcError) throw rpcError;
            return data;
        } catch (e: any) {
            console.error('[useBookAppointment] Error:', e);
            setError(e.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { bookAppointment, loading, error };
};
