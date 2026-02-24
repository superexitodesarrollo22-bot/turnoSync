import * as Notifications from 'expo-notifications';
import { supabase } from '../config/supabase';

// ─── Local Notifications ──────────────────────────────

/**
 * Send a local push notification on this device.
 */
export async function sendLocalNotification(title: string, body: string): Promise<void> {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
            },
            trigger: null, // immediate
        });
    } catch (err) {
        console.warn('[notifications] sendLocal error:', err);
    }
}

// ─── Client Notifications ─────────────────────────────

export async function notifyBookingConfirmed(
    businessName: string,
    serviceName: string,
    dateLabel: string,
    timeLabel: string
): Promise<void> {
    await sendLocalNotification(
        '✅ ¡Turno reservado!',
        `${businessName} · ${serviceName}\n${dateLabel} a las ${timeLabel}`
    );
}

export async function notifyBookingCancelled(
    businessName: string,
    dateLabel: string,
    timeLabel: string
): Promise<void> {
    await sendLocalNotification(
        'Turno cancelado',
        `Tu turno del ${dateLabel} a las ${timeLabel} en ${businessName} fue cancelado.`
    );
}



