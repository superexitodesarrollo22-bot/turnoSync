import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const requestAllPermissions = async (): Promise<void> => {
    try {
        // Notificaciones: solo en production build
        if (!isExpoGo) {
            const { status, canAskAgain } =
                await Notifications.getPermissionsAsync();
            if (status !== 'granted' && canAskAgain) {
                await Notifications.requestPermissionsAsync();
            }
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#C9A84C',
                });
            }
        }

        // Ubicacion
        const { status: locStatus, canAskAgain: locCanAsk } =
            await Location.getForegroundPermissionsAsync();
        if (locStatus !== 'granted' && locCanAsk) {
            await Location.requestForegroundPermissionsAsync();
        }
    } catch { }
};
