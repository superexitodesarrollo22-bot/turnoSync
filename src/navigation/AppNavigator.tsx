import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import BusinessDetailScreen from '../screens/Business/BusinessDetailScreen';
import BookingSelectServiceScreen from '../screens/booking/BookingSelectServiceScreen';
import BookingSelectStaffScreen from '../screens/booking/BookingSelectStaffScreen';
import BookingSelectDateScreen from '../screens/booking/BookingSelectDateScreen';
import BookingSelectSlotScreen from '../screens/booking/BookingSelectSlotScreen';
import BookingConfirmScreen from '../screens/booking/BookingConfirmScreen';
import BookingSuccessScreen from '../screens/booking/BookingSuccessScreen';
import AppointmentDetailScreen from '../screens/appointments/AppointmentDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
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
