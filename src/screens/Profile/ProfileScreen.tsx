import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useAuth } from '../../contexts/AuthContext';
import { UserAvatar } from '../../components/ui/UserAvatar';
import { SkeletonBox } from '../../components/ui/SkeletonBox';

export default function ProfileScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const { user, loading } = useCurrentUser();
    const { signOut } = useAuth();

    console.log('ProfileScreen State:', { user: user?.email, loading });

    if (loading) return (
        <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60, alignItems: 'center' }}>
            <SkeletonBox width={80} height={80} borderRadius={40} style={{ marginTop: 20 }} />
            <SkeletonBox width="50%" height={22} borderRadius={8} style={{ marginTop: 16 }} />
            <SkeletonBox width="65%" height={16} borderRadius={6} style={{ marginTop: 8 }} />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Mi perfil</Text>
            <View style={{ alignItems: 'center', paddingVertical: 28 }}>
                <UserAvatar uri={user?.avatar_url} name={user?.full_name ?? ''} size={80} />
                <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.full_name}</Text>
                <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
            </View>
            <View style={{ paddingHorizontal: 20 }}>
                {[
                    { icon: 'bell', label: 'Notificaciones' },
                    { icon: 'shield', label: 'Privacidad' },
                    { icon: 'info', label: 'Acerca de TurnoSync' },
                ].map((item, i) => (
                    <TouchableOpacity key={i} style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]} activeOpacity={0.7}>
                        <Feather name={item.icon as any} size={18} color={colors.textSecondary} />
                        <Text style={[styles.itemLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                        <Feather name="chevron-right" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]} activeOpacity={0.7} onPress={() => signOut()}>
                    <Feather name="log-out" size={18} color={colors.error} />
                    <Text style={[styles.itemLabel, { color: colors.error }]}>Cerrar sesión</Text>
                </TouchableOpacity>
                <Text style={[styles.version, { color: colors.textMuted }]}>TurnoSync v1.0.0</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    title: { fontSize: 26, fontWeight: '800', paddingHorizontal: 20, marginBottom: 8 },
    name: { fontSize: 20, fontWeight: '700', marginTop: 14 },
    email: { fontSize: 14, marginTop: 4 },
    item: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
    itemLabel: { flex: 1, fontSize: 15 },
    version: { textAlign: 'center', fontSize: 12, marginTop: 24 },
});
