import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export const requestAllPermissions = async (): Promise<void> => {
    try {
        // 1. Notifications Permissions
        const { status: notifStatus, canAskAgain: notifCanAsk } =
            await Notifications.getPermissionsAsync();

        if (notifStatus !== 'granted') {
            if (notifCanAsk) {
                const { status } = await Notifications.requestPermissionsAsync();
                if (status !== 'granted') {
                    console.log('[Permissions] Notifications denied');
                }
            }
        }

        // 2. Location Permissions (for nearby businesses)
        const { status: locStatus, canAskAgain: locCanAsk } =
            await Location.getForegroundPermissionsAsync();

        if (locStatus !== 'granted') {
            if (locCanAsk) {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.log('[Permissions] Location denied');
                }
            }
        }

        // 3. Android High-res configuration
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }
    } catch (error) {
        console.error('[Permissions] Error requesting permissions:', error);
    }
};
