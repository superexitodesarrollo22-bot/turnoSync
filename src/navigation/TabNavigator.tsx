import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import HomeScreen from '../screens/Home/HomeScreen';
import MyBookingsScreen from '../screens/MyBookings/MyBookingsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                    const icons: any = { Home: 'home', MyBookings: 'calendar', Profile: 'user' };
                    return <Feather name={icons[route.name]} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.navBar,
                    borderTopColor: colors.divider,
                    borderTopWidth: 1,
                    height: 56 + insets.bottom,
                    paddingBottom: insets.bottom,
                    paddingTop: 8,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Inicio' }} />
            <Tab.Screen name="MyBookings" component={MyBookingsScreen} options={{ tabBarLabel: 'Mis turnos' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Perfil' }} />
        </Tab.Navigator>
    );
}
