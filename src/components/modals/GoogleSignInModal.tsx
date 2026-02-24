import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export const GoogleSignInModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
    const { signInWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { if (!visible) { setLoading(false); setError(null); } }, [visible]);

    const handlePress = async () => {
        if (loading) return;
        setLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
        } catch {
            setError('No se pudo conectar. Intenta de nuevo.');
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={loading ? undefined : onClose}>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={loading ? undefined : onClose} />
            <View style={styles.card}>
                <View style={styles.handle} />
                <View style={styles.iconWrap}><Text style={{ fontSize: 36 }}>✂️</Text></View>
                <Text style={styles.title}>Elige una cuenta</Text>
                <Text style={styles.subtitle}>para continuar en TurnoSync</Text>
                {error && <View style={styles.errorBox}><Feather name="alert-circle" size={14} color="#D93025" /><Text style={styles.errorText}>{error}</Text></View>}
                <TouchableOpacity style={styles.googleRow} onPress={handlePress} disabled={loading} activeOpacity={0.7}>
                    <View style={styles.gIcon}><Text style={styles.gLetter}>G</Text></View>
                    <View style={{ flex: 1 }}>
                        {loading ? <ActivityIndicator color="#1A73E8" /> : <>
                            <Text style={styles.gName}>Cuenta de Google</Text>
                            <Text style={styles.gHint}>Toca para elegir tu cuenta</Text>
                        </>}
                    </View>
                    <Feather name="chevron-right" size={18} color="#5F6368" />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.googleRow} onPress={handlePress} disabled={loading} activeOpacity={0.7}>
                    <View style={[styles.gIcon, { backgroundColor: '#E8F0FE' }]}><Feather name="user-plus" size={18} color="#1A73E8" /></View>
                    <Text style={[styles.gName, { color: '#1A73E8' }]}>Agregar otra cuenta</Text>
                </TouchableOpacity>
                <Text style={styles.legal}>Al continuar aceptas nuestros <Text style={{ color: '#1A73E8' }}>Términos</Text> y <Text style={{ color: '#1A73E8' }}>Privacidad</Text></Text>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
    card: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12, alignItems: 'center' },
    handle: { width: 40, height: 4, borderRadius: 100, backgroundColor: '#E0E0E0', marginBottom: 24 },
    iconWrap: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#F1F3F4', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#E0E0E0' },
    title: { fontSize: 20, fontWeight: '600', color: '#202124', marginBottom: 4 },
    subtitle: { fontSize: 14, color: '#5F6368', marginBottom: 24 },
    errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FCE8E6', padding: 10, borderRadius: 8, width: '100%', marginBottom: 12 },
    errorText: { color: '#D93025', fontSize: 13, flex: 1 },
    googleRow: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingVertical: 12, gap: 14 },
    gIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F3F4', justifyContent: 'center', alignItems: 'center' },
    gLetter: { fontSize: 18, fontWeight: '700', color: '#4285F4' },
    gName: { fontSize: 15, fontWeight: '500', color: '#202124' },
    gHint: { fontSize: 12, color: '#5F6368', marginTop: 1 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E0E0E0', width: '100%', marginVertical: 4 },
    legal: { fontSize: 11, color: '#80868B', textAlign: 'center', marginTop: 20 },
});
