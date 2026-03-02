import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import BusinessDetailScreen from '../screens/Business/BusinessDetailScreen';
import ConfirmBookingScreen from '../screens/Booking/ConfirmBookingScreen';

// Placeholder components for new screens
const PlaceholderScreen = ({ name }: { name: string }) => (
    <View style={{ flex: 1, backgroundColor: '#0D0D1A', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 20 }}>{name} Screen</Text>
    </View>
);

const BusinessList = () => <PlaceholderScreen name="BusinessList" />;
const SelectService = () => <PlaceholderScreen name="SelectService" />;
const SelectBarber = () => <PlaceholderScreen name="SelectBarber" />;
const SelectDateTime = () => <PlaceholderScreen name="SelectDateTime" />;
const BookingSuccess = () => <PlaceholderScreen name="BookingSuccess" />;

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="BusinessList" component={BusinessList} />
            <Stack.Screen name="BusinessDetail" component={BusinessDetailScreen} />
            <Stack.Screen name="SelectService" component={SelectService} />
            <Stack.Screen name="SelectBarber" component={SelectBarber} />
            <Stack.Screen name="SelectDateTime" component={SelectDateTime} />
            <Stack.Screen name="ConfirmBooking" component={ConfirmBookingScreen} />
            <Stack.Screen name="BookingSuccess" component={BookingSuccess} />
        </Stack.Navigator>
    );
}
