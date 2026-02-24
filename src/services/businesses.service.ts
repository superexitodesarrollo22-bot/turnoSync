import { supabase } from '../config/supabase';
import { Business } from '../types';

/**
 * Fetch all active businesses.
 */
export async function getBusinesses(): Promise<Business[]> {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('active', true)
        .order('name');

    if (error) {
        console.error('[getBusinesses]', error.message);
        return [];
    }
    return (data as Business[]) ?? [];
}

/**
 * Fetch a single business by ID.
 */
export async function getBusinessById(id: string): Promise<Business | null> {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .eq('active', true)
        .single();

    if (error) {
        console.error('[getBusinessById]', error.message);
        return null;
    }
    return data as Business;
}

/**
 * Search businesses by name (case-insensitive).
 */
export async function searchBusinesses(query: string): Promise<Business[]> {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('active', true)
        .ilike('name', `%${query}%`)
        .order('name')
        .limit(20);

    if (error) {
        console.error('[searchBusinesses]', error.message);
        return [];
    }
    return (data as Business[]) ?? [];
}

/**
 * Get services for a business.
 */
export async function getBusinessServices(businessId: string) {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('active', true)
        .order('name');

    if (error) {
        console.error('[getBusinessServices]', error.message);
        return [];
    }
    return data ?? [];
}

/**
 * Get staff for a business.
 */
export async function getBusinessStaff(businessId: string) {
    const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('business_id', businessId)
        .eq('active', true)
        .order('name');

    if (error) {
        console.error('[getBusinessStaff]', error.message);
        return [];
    }
    return data ?? [];
}

/**
 * Get schedules for a business.
 */
export async function getBusinessSchedules(businessId: string) {
    const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('business_id', businessId)
        .order('weekday');

    if (error) {
        console.error('[getBusinessSchedules]', error.message);
        return [];
    }
    return data ?? [];
}
