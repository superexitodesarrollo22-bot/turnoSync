import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../services/supabase';

/**
 * Pantalla intermedia que se muestra cuando Supabase redirige desde el callback.
 * Solo espera a que se procesen los tokens.
 */
export default function AuthCallbackScreen() {
    const { colors } = useTheme();

    useEffect(() => {
        const processCallback = async () => {
            try {
                console.log('[AuthCallback] Procesando callback...');

                // Obtener la sesión que Supabase acaba de establecer
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('[AuthCallback] Error:', error.message);
                    return;
                }

                if (data.session) {
                    console.log('[AuthCallback] ✅ Sesión establecida');
                    // El onAuthStateChange en AuthContext se dispara automáticamente
                    // y redirige al usuario a la app principal
                } else {
                    console.log('[AuthCallback] Esperando sesión...');
                }
            } catch (err) {
                console.error('[AuthCallback]', err);
            }
        };

        // Pequeña espera para que Supabase procese completamente
        const timeout = setTimeout(processCallback, 500);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={{ color: colors.textSecondary, marginTop: 16 }}>Procesando autenticación...</Text>
        </View>
    );
}