import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../services/supabase';

const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Configurar cómo se muestran las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Registra el token Expo Push del dispositivo en la tabla user_devices de Supabase.
 * Se debe llamar justo después del login cuando ya tenemos el userId interno (tabla users).
 */
export async function registerClientPushToken(userId: string): Promise<string | null> {
    if (!Device.isDevice) {
        console.log('[Push] No es un dispositivo físico, omitiendo registro.');
        return null;
    }

    if (isExpoGo) {
        console.log('[Push] Expo Go: remote push no disponible SDK53+.');
        return null;
    }

    // Pedir/verificar permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('[Push] Permiso de notificaciones denegado.');
        return null;
    }

    // Crear canal Android
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('turnos', {
            name: 'Mis Turnos',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FFFFFF',
            sound: 'default',
        });
    }

    try {
        const tokenData = isExpoGo
            ? await Notifications.getExpoPushTokenAsync()
            : await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas?.projectId,
            });

        const token = tokenData.data;
        console.log('[Push] Token obtenido:', token);

        // Insertar solo si aún no existe esta combinación user_id + token
        const { data: existing } = await supabase
            .from('user_devices')
            .select('id')
            .eq('user_id', userId)
            .eq('expo_push_token', token)
            .maybeSingle();

        if (!existing) {
            const { error } = await supabase
                .from('user_devices')
                .insert({ user_id: userId, expo_push_token: token });

            if (error) {
                console.error('[Push] Error al guardar token:', error.message);
            } else {
                console.log('[Push] Token registrado en Supabase ✅');
            }
        } else {
            console.log('[Push] Token ya registrado, sin cambios.');
        }

        return token;
    } catch (error) {
        console.log('[Push] Token no disponible (emulador o sin EAS projectId):', error);
        return null;
    }
}
