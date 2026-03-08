import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SocialLoginScreen from '../screens/Auth/SocialLoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { useOnboarding } from '../hooks/useOnboarding';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    const { shouldShowOnboarding, completeOnboarding, loading } = useOnboarding();

    // Mientras se lee AsyncStorage no renderizar nada (< 50ms en práctica)
    if (loading) return null;

    // Primera vez → mostrar onboarding antes del login
    if (shouldShowOnboarding) {
        return <OnboardingScreen onDone={completeOnboarding} />;
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="SocialLogin" component={SocialLoginScreen} />
        </Stack.Navigator>
    );
}
