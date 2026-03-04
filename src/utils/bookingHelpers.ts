/**
 * Formatea centavos a string con formato de moneda ARS
 * @param priceCents Precio en centavos (entero)
 */
export const formatPrice = (priceCents: number): string => {
    if (priceCents == null) return '$0';
    const amount = priceCents / 100;
    return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
};

/**
 * Convierte minutos a texto legible (ej: "1 h 30 min" o "30 min")
 * @param minutes Duración en minutos
 */
export const formatDuration = (minutes: number): string => {
    if (!minutes) return '0 min';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) {
        return `${h} h${m > 0 ? ` ${m} min` : ''}`;
    }
    return `${m} min`;
};

/**
 * Convierte un timestamp ISO al horario local formateado (HH:MM)
 * @param isoString Timestamp ISO con timezone
 */
export const formatSlotTime = (isoString: string): string => {
    try {
        const date = new Date(isoString);
        return date.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch (e) {
        return '—';
    }
};

/**
 * Convierte 'YYYY-MM-DD' a texto completo en español
 * Ejemplo: '2025-03-15' -> 'Sábado 15 de marzo de 2025'
 */
export const formatFullDate = (dateString: string): string => {
    try {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const text = date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        return text.charAt(0).toUpperCase() + text.slice(1);
    } catch (e) {
        return dateString;
    }
};

/**
 * Fecha corta para AppointmentCard
 * Ejemplo ISO -> 'Sáb 15 mar · 14:00 hs'
 */
export const formatShortDate = (isoString: string): string => {
    try {
        const date = new Date(isoString);
        const day = date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
        const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        return `${day.charAt(0).toUpperCase() + day.slice(1)} · ${time} hs`;
    } catch (e) {
        return isoString;
    }
};

/**
 * Traduce el status al español con su respectivo color
 */
export const getStatusLabel = (status: string) => {
    switch (status) {
        case 'pending':
            return { label: 'Pendiente', color: '#F59E0B' };
        case 'confirmed':
            return { label: 'Confirmado', color: '#10B981' };
        case 'completed':
            return { label: 'Completado', color: '#6B7280' };
        case 'cancelled':
            return { label: 'Cancelado', color: '#EF4444' };
        default:
            return { label: status, color: '#C9A84C' };
    }
};

/**
 * Retorna el nombre del día de la semana (0 = Domingo)
 */
export const getWeekdayName = (number: number): string => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[number] || '';
};

/**
 * Verifica si una fecha debe estar deshabilitada en el calendario
 */
export const isDateDisabled = (
    dateString: string,
    workingWeekdays: number[],
    blackoutDates: string[],
    maxAdvanceDays: number
): boolean => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const target = new Date(dateString);
    target.setHours(0, 0, 0, 0);

    // 1. Pasado
    if (target < now) return true;

    // 2. Fuera de rango
    const maxDate = new Date();
    maxDate.setDate(now.getDate() + (maxAdvanceDays || 15));
    if (target > maxDate) return true;

    // 3. No laborable (0-6, donde 0 es domingo)
    // Nota: JS getDay() es 0=Dom, 1=Lun...
    const weekday = target.getDay();
    if (workingWeekdays.length > 0 && !workingWeekdays.includes(weekday)) return true;

    // 4. Blackout
    if (blackoutDates.includes(dateString)) return true;

    return false;
};
