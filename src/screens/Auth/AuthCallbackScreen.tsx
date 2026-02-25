import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../services/supabase';

/**
 * Pantalla de callback para web.
 * Supabase redirige aquí con tokens en la URL.
 * Esta pantalla simplemente espera a que se procesen.
 */
export default function AuthCallbackScreen() {
    const navigation = useNavigation();
    const { colors } = useTheme();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Supabase detecta automáticamente los tokens en la URL en web
                // El onAuthStateChange en AuthProvider se dispara automáticamente

                console.log('[AuthCallback] Esperando procesamiento de tokens...');

                // Obtener sesión para confirmar
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('[AuthCallback] Error:', error.message);
                    return;
                }

                if (data.session) {
                    console.log('[AuthCallback] ✅ Sesión establecida, esperando redirección...');
                    // El AuthProvider/RootNavigator ya redirigirá al usuario
                    // Esta pantalla solo es un placeholder
                } else {
                    console.log('[AuthCallback] No hay sesión aún, esperando...');
                    // Podría ser que aún no se haya procesado completamente
                }
            } catch (err) {
                console.error('[AuthCallback] Catch error:', err);
            }
        };

        // Pequeño delay para permitir que Supabase procese
        const timeout = setTimeout(handleCallback, 1000);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.accent} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
