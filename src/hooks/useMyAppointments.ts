import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../config/supabase';

type FilterType = 'upcoming' | 'past' | 'cancelled';

// Cache en memoria compartida entre renders
// Se limpia cuando el componente padre se desmonta (cierre de sesion)
const cache: Partial<Record<FilterType, { data: any[]; ts: number }>> = {};
const CACHE_TTL_MS = 30_000; // 30 segundos

function isCacheValid(filter: FilterType): boolean {
    const entry = cache[filter];
    if (!entry) return false;
    return Date.now() - entry.ts < CACHE_TTL_MS;
}

async function fetchForFilter(filter: FilterType): Promise<any[]> {
    // Paso 1: obtener usuario autenticado
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) return [];

    // Paso 2: obtener id interno
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_auth_uid', authUser.id)
        .single();
    if (userError || !userData) return [];

    // Paso 3: query filtrada
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
        `)
        .eq('client_user_id', userData.id);

    const now = new Date().toISOString();

    if (filter === 'upcoming') {
        query = query.gte('start_at', now).neq('status', 'cancelled');
    } else if (filter === 'past') {
        query = query.lt('start_at', now).neq('status', 'cancelled');
    } else if (filter === 'cancelled') {
        query = query.eq('status', 'cancelled');
    }

    const { data, error } = await query
        .order('start_at', { ascending: filter !== 'past' })
        .limit(50);

    if (error) throw error;
    return data ?? [];
}

export const useMyAppointments = (filter: FilterType = 'upcoming') => {
    const [appointments, setAppointments] = useState<any[]>(
        cache[filter]?.data ?? []
    );
    const [loading, setLoading] = useState(!isCacheValid(filter));
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);

    const fetchAppointments = useCallback(async (force = false) => {
        // Si hay cache valido y no es forzado, usar cache
        if (!force && isCacheValid(filter)) {
            setAppointments(cache[filter]!.data);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await fetchForFilter(filter);
            if (!mountedRef.current) return;
            cache[filter] = { data, ts: Date.now() };
            setAppointments(data);
        } catch (e: any) {
            if (!mountedRef.current) return;
            console.error('[useMyAppointments] Error:', e);
            setError(e.message);
            setAppointments([]);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        mountedRef.current = true;
        fetchAppointments();

        // Precargar los otros tabs en background sin bloquear la UI
        const otherFilters: FilterType[] = ['upcoming', 'past', 'cancelled']
            .filter(f => f !== filter) as FilterType[];

        otherFilters.forEach(f => {
            if (!isCacheValid(f)) {
                fetchForFilter(f).then(data => {
                    cache[f] = { data, ts: Date.now() };
                }).catch(() => {});
            }
        });

        return () => { mountedRef.current = false; };
    }, [fetchAppointments]);

    const cancelAppointment = async (appointmentId: string) => {
        try {
            const { error: cancelError } = await supabase
                .rpc('cancel_appointment', { p_appointment_id: appointmentId });
            if (cancelError) throw cancelError;
            // Invalidar cache de todos los tabs
            delete cache['upcoming'];
            delete cache['past'];
            delete cache['cancelled'];
            await fetchAppointments(true);
            return true;
        } catch (e: any) {
            console.error('[useMyAppointments] Cancel Error:', e);
            return false;
        }
    };

    // Funcion para invalidar cache desde afuera (ej: al crear un turno nuevo)
    const invalidateCache = () => {
        delete cache['upcoming'];
        delete cache['past'];
        delete cache['cancelled'];
    };

    return {
        appointments,
        loading,
        error,
        refetch: () => fetchAppointments(true),
        cancelAppointment,
        invalidateCache,
    };
};

// Exportar funcion para limpiar el cache al cerrar sesion
export function clearAppointmentsCache() {
    delete cache['upcoming'];
    delete cache['past'];
    delete cache['cancelled'];
}
