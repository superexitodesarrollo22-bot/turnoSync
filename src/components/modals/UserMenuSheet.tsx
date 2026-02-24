import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../contexts/AuthContext';
import { UserAvatar } from '../ui/UserAvatar';
import { useNavigation } from '@react-navigation/native';

const ITEMS = [
    { icon: 'bell', label: 'Notificaciones', route: null },
    { icon: 'globe', label: 'Idioma', route: null },
    { icon: 'shield', label: 'Política de privacidad', url: 'https://turnosync.app/privacidad' },
    { icon: 'file-text', label: 'Términos y condiciones', url: 'https://turnosync.app/terminos' },
    { icon: 'mail', label: 'Contactar soporte', url: 'mailto:soporte@turnosync.app' },
];

export const UserMenuSheet = ({ visible, onClose, user }: any) => {
    const { colors, isDark } = useTheme();
    const { signOut } = useAuth();
    const navigation = useNavigation<any>();

    const handleSignOut = () => {
        Alert.alert('Cerrar sesión', '¿Seguro que deseas cerrar sesión?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Cerrar sesión', style: 'destructive', onPress: async () => { onClose(); await signOut(); } },
        ]);
    };

    return (
        <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
            <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} activeOpacity={1} onPress={onClose} />
            <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
                <View style={[styles.handle, { backgroundColor: colors.divider }]} />
                <View style={styles.profileRow}>
                    <UserAvatar uri={user?.avatar_url} name={user?.full_name ?? ''} size={52} />
                    <View style={{ marginLeft: 14, flex: 1 }}>
                        <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.full_name}</Text>
                        <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
                    </View>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                <ScrollView showsVerticalScrollIndicator={false}>
                    {ITEMS.map((item: any, i) => (
                        <TouchableOpacity key={i} style={styles.item} activeOpacity={0.7}
                            onPress={() => { if (item.url) Linking.openURL(item.url); }}>
                            <Feather name={item.icon as any} size={18} color={colors.textSecondary} />
                            <Text style={[styles.label, { color: colors.textPrimary }]}>{item.label}</Text>
                            <Feather name="chevron-right" size={16} color={colors.textMuted} />
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.item} activeOpacity={0.7} onPress={handleSignOut}>
                        <Feather name="log-out" size={18} color={colors.error} />
                        <Text style={[styles.label, { color: colors.error }]}>Cerrar sesión</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.supportBtn, { backgroundColor: colors.surfaceElevated }]} onPress={() => Linking.openURL('mailto:soporte@turnosync.app')}>
                        <Text style={[styles.supportText, { color: colors.textPrimary }]}>Contactar con el soporte</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12, maxHeight: '80%' },
    handle: { width: 40, height: 4, borderRadius: 100, alignSelf: 'center', marginBottom: 20 },
    profileRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
    name: { fontSize: 16, fontWeight: '700' },
    email: { fontSize: 13, marginTop: 2 },
    divider: { height: 1, marginVertical: 8 },
    item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
    label: { flex: 1, fontSize: 15 },
    supportBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
    supportText: { fontSize: 15, fontWeight: '600' },
});
