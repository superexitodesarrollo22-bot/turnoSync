import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import TabNavigator from './TabNavigator';
import BusinessDetailScreen from '../screens/Business/BusinessDetailScreen';
import BookingSelectServiceScreen from '../screens/Booking/BookingSelectServiceScreen';
import BookingSelectStaffScreen from '../screens/Booking/BookingSelectStaffScreen';
import BookingSelectDateScreen from '../screens/Booking/BookingSelectDateScreen';
import BookingSelectSlotScreen from '../screens/Booking/BookingSelectSlotScreen';
import BookingConfirmScreen from '../screens/Booking/BookingConfirmScreen';
import BookingSuccessScreen from '../screens/Booking/BookingSuccessScreen';
import AppointmentDetailScreen from '../screens/appointments/AppointmentDetailScreen';

const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const Stack = createNativeStackNavigator();

// Ref de navegación exportada para poder navegar desde fuera del árbol de React
export const navigationRef = createNavigationContainerRef<any>();

export default function AppNavigator() {
    useEffect(() => {
        if (isExpoGo) return;

        const responseSubscription = Notifications.addNotificationResponseReceivedListener(
            response => {
                const data = response.notification.request.content.data;
                if (!data?.appointmentId) return;
                const type = data.type as string;
                if (type === 'new_appointment' || type === 'reminder_admin') {
                    setTimeout(() => {
                        if (navigationRef.isReady()) {
                            navigationRef.dispatch(
                                CommonActions.navigate('Main', {
                                    screen: 'Turnos',
                                    params: { appointmentId: data.appointmentId },
                                })
                            );
                        }
                    }, 500);
                }
            }
        );

        const foregroundSub = Notifications.addNotificationReceivedListener(
            notification => {
                console.log(
                    '[Push] Notificacion en primer plano:',
                    notification.request.content.title
                );
            }
        );

        return () => {
            responseSubscription.remove();
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
