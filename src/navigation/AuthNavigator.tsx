import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SocialLoginScreen from '../screens/Auth/SocialLoginScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right'
            }}
        >
            <Stack.Screen name="SocialLogin" component={SocialLoginScreen} />
        </Stack.Navigator>
    );
}
