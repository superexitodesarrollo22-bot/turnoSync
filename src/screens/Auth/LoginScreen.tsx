import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const { colors } = useTheme();

    useEffect(() => {
        // Redirigir a SocialLoginScreen ya que es la nueva pantalla principal
        navigation.replace('SocialLogin');
    }, [navigation]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
            <ActivityIndicator size="large" color={colors.accent} />
        </View>
    );
}
