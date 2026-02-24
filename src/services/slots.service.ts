import { supabase } from '../config/supabase';
import { Schedule, Appointment } from '../types';

// ─── Types ────────────────────────────────────────────

export interface TimeSlot {
    time: string;       // HH:MM
    startAt: string;    // ISO datetime
    endAt: string;      // ISO datetime
    isAvailable: boolean;
    appointment?: Appointment | null;
}

export const DURATION_OPTIONS = [15, 30, 45, 60, 90] as const;
export type SlotDuration = typeof DURATION_OPTIONS[number];

// ─── Generate Slots ───────────────────────────────────

/**
 * Generates time slots for a given date based on business schedule and existing appointments.
 * This function is reusable by both the admin panel and the client booking flow.
 *
 * @param businessId - The business UUID
 * @param date - The date to generate slots for (YYYY-MM-DD)
 * @param durationMinutes - Duration of each slot in minutes
 * @param filterPast - If true, past slots are marked as unavailable (default true)
 */
export async function generateSlots(
    businessId: string,
    date: string,
    durationMinutes: number,
    filterPast: boolean = true
): Promise<TimeSlot[]> {
    // Get the weekday for the date (0=Sunday, 6=Saturday)
    const dateObj = new Date(date + 'T00:00:00');
    const weekday = dateObj.getDay();

    // Fetch schedule for this weekday
    const { data: schedules, error: schedError } = await supabase
        .from('schedules')
        .select('*')
        .eq('business_id', businessId)
        .eq('weekday', weekday);

    if (schedError || !schedules || schedules.length === 0) {
        return []; // Business is closed on this day
    }

    // Fetch existing appointments for this date (non-cancelled)
    const dayStart = `${date}T00:00:00`;
    const dayEnd = `${date}T23:59:59`;

    const { data: appointments, error: apptError } = await supabase
        .from('appointments')
        .select(`
      *,
      services(name, duration_minutes, price_cents),
      users!appointments_client_user_id_fkey(full_name, avatar_url)
    `)
        .eq('business_id', businessId)
        .gte('start_at', dayStart)
        .lte('start_at', dayEnd)
        .not('status', 'eq', 'cancelled');

    const bookedSlots = (apptError ? [] : appointments ?? []) as any[];

    const now = new Date();
    const slots: TimeSlot[] = [];

    // Generate slots for each schedule block of the day
    for (const schedule of schedules) {
        const [startH, startM] = schedule.start_time.split(':').map(Number);
        const [endH, endM] = schedule.end_time.split(':').map(Number);

        let currentMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        while (currentMinutes + durationMinutes <= endMinutes) {
            const hours = Math.floor(currentMinutes / 60);
            const mins = currentMinutes % 60;
            const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

            const slotStart = new Date(`${date}T${timeStr}:00`);
            const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

            // Check if this slot is booked
            const matchingAppointment = bookedSlots.find(appt => {
                const apptStart = new Date(appt.start_at);
                return Math.abs(apptStart.getTime() - slotStart.getTime()) < 60000; // within 1 min
            });

            // Check if slot is in the past
            const isPast = filterPast && slotStart < now;

            slots.push({
                time: timeStr,
                startAt: slotStart.toISOString(),
                endAt: slotEnd.toISOString(),
                isAvailable: !matchingAppointment && !isPast,
                appointment: matchingAppointment || null,
            });

            currentMinutes += durationMinutes;
        }
    }

    return slots;
}

/**
 * Get available slots only (for client booking flow).
 */
export async function getAvailableSlots(
    businessId: string,
    date: string,
    durationMinutes: number
): Promise<TimeSlot[]> {
    const allSlots = await generateSlots(businessId, date, durationMinutes, true);
    return allSlots.filter(s => s.isAvailable);
}
