import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import HomeScreen from '../screens/Home/HomeScreen';
import MyBookingsScreen from '../screens/MyBookings/MyBookingsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, color, focused, accent }: { name: any, color: string, focused: boolean, accent: string }) => (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%', paddingTop: 5 }}>
        <Feather name={name} size={22} color={color} />
        {focused && (
            <View style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: accent,
                marginTop: 4,
            }} />
        )}
    </View>
);

export default function TabNavigator() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();

    const ACTIVE_COLOR = '#C9A84C';
    const INACTIVE_COLOR = '#4A4A5A';

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, focused }) => {
                    const icons: any = {
                        Home: 'home',
                        MyBookings: 'calendar',
                        Profile: 'user'
                    };
                    return <TabBarIcon name={icons[route.name]} color={color} focused={focused} accent={ACTIVE_COLOR} />;
                },
                tabBarActiveTintColor: ACTIVE_COLOR,
                tabBarInactiveTintColor: INACTIVE_COLOR,
                tabBarStyle: {
                    backgroundColor: colors.navBar,
                    borderTopColor: colors.divider,
                    borderTopWidth: 1,
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom,
                    paddingTop: 8,
                    elevation: isDark ? 0 : 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: isDark ? 0 : 0.06,
                    shadowRadius: 8,
                },
                tabBarLabelStyle: { fontSize: 10, fontWeight: 'bold' },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Inicio' }} />
            <Tab.Screen name="MyBookings" component={MyBookingsScreen} options={{ tabBarLabel: 'Turnos' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Perfil' }} />
        </Tab.Navigator>
    );
}
