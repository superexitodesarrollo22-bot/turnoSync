import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export async function sendLocalNotification(
    title: string,
    body: string
): Promise<void> {
    if (isExpoGo) return;
    try {
        await Notifications.scheduleNotificationAsync({
            content: { title, body, sound: true },
            trigger: null,
        });
    } catch { }
}

export async function notifyBookingConfirmed(
    businessName: string,
    serviceName: string,
    dateLabel: string,
    timeLabel: string
): Promise<void> {
    await sendLocalNotification(
        'Turno reservado',
        `${businessName} - ${serviceName}\n${dateLabel} a las ${timeLabel}`
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
