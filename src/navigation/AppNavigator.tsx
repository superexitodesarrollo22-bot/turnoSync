import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import TabNavigator from './TabNavigator';
import BusinessDetailScreen from '../screens/Business/BusinessDetailScreen';
import BookingSelectServiceScreen from '../screens/Booking/BookingSelectServiceScreen';
import BookingSelectStaffScreen from '../screens/Booking/BookingSelectStaffScreen';
import BookingSelectDateScreen from '../screens/Booking/BookingSelectDateScreen';
import BookingSelectSlotScreen from '../screens/Booking/BookingSelectSlotScreen';
import BookingConfirmScreen from '../screens/Booking/BookingConfirmScreen';
import BookingSuccessScreen from '../screens/Booking/BookingSuccessScreen';
import AppointmentDetailScreen from '../screens/appointments/AppointmentDetailScreen';

const Stack = createNativeStackNavigator();

// Ref de navegación exportada para poder navegar desde fuera del árbol de React
export const navigationRef = createNavigationContainerRef<any>();

export default function AppNavigator() {
    useEffect(() => {
        // Listener: el cliente TOCA la notificación push (app cerrada o en background)
        const subscription = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                const data = response.notification.request.content.data;

                if (!data?.appointmentId) return;

                const type = data.type as string;

                if (type === 'reminder_client') {
                    // Delay para que NavigationContainer esté listo tras arranque en frío
                    setTimeout(() => {
                        if (navigationRef.isReady()) {
                            navigationRef.dispatch(
                                CommonActions.navigate('AppointmentDetail', {
                                    appointmentId: data.appointmentId,
                                })
                            );
                        }
                    }, 500);
                }
            }
        );

        // Listener foreground: notificación recibida con la app abierta
        const foregroundSub = Notifications.addNotificationReceivedListener(
            (notification) => {
                console.log(
                    '[Push TurnoSync] Notificación en primer plano:',
                    notification.request.content.title
                );
            }
        );

        return () => {
            subscription.remove();
            foregroundSub.remove();
        };
    }, []);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="BusinessDetail" component={BusinessDetailScreen} />
            <Stack.Screen name="BookingSelectService" component={BookingSelectServiceScreen} />
            <Stack.Screen name="BookingSelectStaff" component={BookingSelectStaffScreen} />
            <Stack.Screen name="BookingSelectDate" component={BookingSelectDateScreen} />
            <Stack.Screen name="BookingSelectSlot" component={BookingSelectSlotScreen} />
            <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
            <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
            <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
        </Stack.Navigator>
    );
}
