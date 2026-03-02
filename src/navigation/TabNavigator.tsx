import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import HomeScreen from '../screens/Home/HomeScreen';
import MyBookingsScreen from '../screens/MyBookings/MyBookingsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ServicesScreen from '../screens/Services/ServicesScreen';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, color, focused }: { name: any, color: string, focused: boolean }) => (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Feather name={name} size={22} color={color} />
        {focused && (
            <View style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: '#C9A84C',
                marginTop: 4,
                position: 'absolute',
                bottom: -8
            }} />
        )}
    </View>
);

export default function TabNavigator() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    const COLORS = {
        background: '#0D0D1A',
        gold: '#C9A84C',
        inactive: '#4A4A5A',
        border: '#2A2A3E',
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, focused }) => {
                    const icons: any = {
                        Home: 'home',
                        MyBookings: 'calendar',
                        Services: 'scissors',
                        Profile: 'user'
                    };
                    return <TabBarIcon name={icons[route.name]} color={color} focused={focused} />;
                },
                tabBarActiveTintColor: COLORS.gold,
                tabBarInactiveTintColor: COLORS.inactive,
                tabBarStyle: {
                    backgroundColor: COLORS.background,
                    borderTopColor: COLORS.border,
                    borderTopWidth: 1,
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom,
                    paddingTop: 8,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarLabelStyle: { fontSize: 10, fontWeight: 'bold' },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Inicio' }} />
            <Tab.Screen name="MyBookings" component={MyBookingsScreen} options={{ tabBarLabel: 'Turnos' }} />
            <Tab.Screen name="Services" component={ServicesScreen} options={{ tabBarLabel: 'Servicios' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Perfil' }} />
        </Tab.Navigator>
    );
}
