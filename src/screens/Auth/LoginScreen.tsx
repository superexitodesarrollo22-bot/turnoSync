import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GoogleSignInModal } from '../../components/modals/GoogleSignInModal';
import { useTheme } from '../../hooks/useTheme';

export default function LoginScreen() {
    const { colors, isDark } = useTheme();
    const [showModal, setShowModal] = useState(false);

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
                <TouchableOpacity style={[styles.btn, { backgroundColor: colors.accent }]} onPress={() => setShowModal(true)} activeOpacity={0.85}>
                    <Text style={styles.btnText}>Comenzar con Google</Text>
                </TouchableOpacity>
                <Text style={[styles.legal, { color: colors.textMuted }]}>Al continuar aceptas nuestros términos y política de privacidad</Text>
            </View>
            <GoogleSignInModal visible={showModal} onClose={() => setShowModal(false)} />
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
    btn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 16 },
    btnText: { fontSize: 16, fontWeight: '700', color: '#0D0D1A' },
    legal: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
