import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import * as Linking from 'expo-linking';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../services/supabase';
import { StatusBar } from 'expo-status-bar';

export default function AuthCallbackScreen() {
    const { colors, isDark } = useTheme();

    useEffect(() => {
        const processCallback = async () => {
            try {
                console.log('[AuthCallback] Procesando callback...');

                // Obtener la URL que abrió esta pantalla
                const url = await Linking.getInitialURL();
                console.log('[AuthCallback] URL recibida:', url);

                if (url) {
                    // Extraer tokens del fragmento (#) o query string (?)
                    const fragment = url.split('#')[1] || url.split('?')[1] || '';
                    const params = new URLSearchParams(fragment);

                    const accessToken = params.get('access_token');
                    const refreshToken = params.get('refresh_token');

                    if (accessToken && refreshToken) {
                        console.log('[AuthCallback] ✅ Tokens encontrados');
                        const { error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });
                        if (error) {
                            console.error('[AuthCallback] Error setSession:', error.message);
                        } else {
                            console.log('[AuthCallback] ✅ Sesión establecida');
                        }
                        return;
                    }
                }

                // Fallback: intentar getSession por si ya está procesada
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    console.log('[AuthCallback] ✅ Sesión ya activa');
                } else {
                    console.warn('[AuthCallback] ⚠️ No se encontraron tokens');
                }
            } catch (err: any) {
                console.error('[AuthCallback] Error:', err.message);
            }
        };

        const timeout = setTimeout(processCallback, 300);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={{ color: colors.textSecondary, marginTop: 16 }}>
                Procesando autenticación...
            </Text>
        </View>
    );
}