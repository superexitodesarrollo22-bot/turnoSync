import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import BusinessDetailScreen from '../screens/Business/BusinessDetailScreen';
import ConfirmBookingScreen from '../screens/Booking/ConfirmBookingScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="BusinessDetail" component={BusinessDetailScreen} />
            <Stack.Screen name="ConfirmBooking" component={ConfirmBookingScreen} />
        </Stack.Navigator>
    );
}
