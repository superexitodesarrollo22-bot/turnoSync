import React, { useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
    const { signInWithGoogle, loading } = useAuth();
    const { colors, isDark } = useTheme();
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            await signInWithGoogle();
        } catch (error: any) {
            console.error('❌ Error en login:', error);
            Alert.alert(
                'Error al iniciar sesión',
                error.message || 'No se pudo iniciar sesión. Intenta de nuevo.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const isInteractionDisabled = loading || isLoading;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <View style={styles.center}>
                <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
                    <Text style={{ fontSize: 52 }}>✂️</Text>
                </View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>TurnoSync</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Tu turno, a tiempo</Text>
            </View>

            <View style={styles.bottom}>
                <TouchableOpacity
                    style={[
                        styles.btn,
                        { backgroundColor: colors.accent },
                        isInteractionDisabled && styles.btnDisabled
                    ]}
                    onPress={handleGoogleLogin}
                    disabled={isInteractionDisabled}
                    activeOpacity={0.85}
                >
                    {isInteractionDisabled ? (
                        <ActivityIndicator color="#0D0D1A" />
                    ) : (
                        <Text style={styles.btnText}>Continuar con Google</Text>
                    )}
                </TouchableOpacity>
                <Text style={[styles.legal, { color: colors.textMuted }]}>
                    Al continuar aceptas nuestros términos y política de privacidad
                </Text>

                <Text style={[styles.devInfo, { color: colors.textMuted }]}>
                    {__DEV__ ? '🔧 Modo: DESARROLLO' : '📱 Modo: PRODUCCIÓN'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    iconWrap: { width: 100, height: 100, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 36, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 },
    subtitle: { fontSize: 16 },
    bottom: { paddingHorizontal: 24, paddingBottom: 48 },
    btn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 16, minHeight: 60, justifyContent: 'center' },
    btnDisabled: { opacity: 0.6 },
    btnText: { fontSize: 16, fontWeight: '700', color: '#0D0D1A' },
    legal: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
    devInfo: { marginTop: 20, fontSize: 10, textAlign: 'center', opacity: 0.5 },
});
