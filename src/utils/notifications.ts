import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// NO llamar setNotificationHandler en el top-level.
// Se llama solo desde initNotifications() que se invoca en produccion.
export function initNotifications(): void {
    if (isExpoGo) return;
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

export async function registerForPushNotifications(
    userId: string
): Promise<string | null> {
    if (isExpoGo) return null;
    if (!Device.isDevice) return null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('turnos', {
            name: 'Turnos',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#E94560',
            sound: 'default',
        });
    }

    try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        const token = tokenData.data;
        const { data: existing } = await supabase
            .from('user_devices')
            .select('id')
            .eq('user_id', userId)
            .eq('expo_push_token', token)
            .maybeSingle();
        if (!existing) {
            await supabase.from('user_devices').insert({
                user_id: userId,
                expo_push_token: token,
            });
        }
        return token;
    } catch {
        return null;
    }
}

// Alias para compatibilidad con archivos que usan el nombre viejo
export const registerClientPushToken = registerForPushNotifications;

export async function getNotificationMapping(
    appointmentId: string
): Promise<string | null> {
    try { return await AsyncStorage.getItem(`notif_map_${appointmentId}`); }
    catch { return null; }
}

export async function removeNotificationMapping(
    appointmentId: string
): Promise<void> {
    try { await AsyncStorage.removeItem(`notif_map_${appointmentId}`); }
    catch { }
}

export async function scheduleAppointmentReminder(
    appointment: {
        id: string;
        clientName: string;
        serviceName: string;
        start_at: string;
    },
    minutesBefore: number
): Promise<void> {
    if (isExpoGo) return;
    if (minutesBefore === 0) return;
    try {
        const triggerDate = new Date(
            new Date(appointment.start_at).getTime() - minutesBefore * 60 * 1000
        );
        if (triggerDate <= new Date()) return;
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Recordatorio de turno',
                body: `${appointment.clientName} - ${appointment.serviceName} en ${minutesBefore} min`,
                data: { appointmentId: appointment.id, type: 'reminder_admin' },
                sound: true,
            },
            trigger: { 
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate 
            },
        });
        await AsyncStorage.setItem(`notif_map_${appointment.id}`, id);
    } catch { }
}

export async function cancelAppointmentReminder(
    appointmentId: string
): Promise<void> {
    if (isExpoGo) return;
    try {
        const id = await AsyncStorage.getItem(`notif_map_${appointmentId}`);
        if (id) {
            await Notifications.cancelScheduledNotificationAsync(id);
            await AsyncStorage.removeItem(`notif_map_${appointmentId}`);
        }
    } catch { }
}

export async function cancelAllReminders(): Promise<void> {
    if (isExpoGo) return;
    try { await Notifications.cancelAllScheduledNotificationsAsync(); }
    catch { }
}
