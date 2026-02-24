import { format, toZonedTime } from 'date-fns-tz';
import { DEFAULT_TIMEZONE } from '../config/constants';

/**
 * Convert a UTC date to a given timezone string.
 */
export function toTimezone(
    date: Date | string,
    timezone: string = DEFAULT_TIMEZONE
): Date {
    const d = typeof date === 'string' ? new Date(date) : date;
    return toZonedTime(d, timezone);
}

/**
 * Format a date in a specific timezone.
 */
export function formatInTimezone(
    date: Date | string,
    formatStr: string,
    timezone: string = DEFAULT_TIMEZONE
): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const zonedDate = toZonedTime(d, timezone);
    return format(zonedDate, formatStr, { timeZone: timezone });
}

/**
 * Format price from cents to display string.
 */
export function formatPrice(cents: number, currency = 'USD'): string {
    return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency,
    }).format(cents / 100);
}

/**
 * Format duration in minutes to human-readable string.
 */
export function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

/**
 * Weekday names (0 = Sunday).
 */
export const WEEKDAY_NAMES = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
];
