import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileScreenSkeleton } from '../../components/ui/SkeletonLoader';

const COLORS = {
    background: '#0D0D1A',
    surface: '#1A1A2E',
    border: '#2A2A3E',
    gold: '#C9A84C',
    white: '#FFFFFF',
    textSecondary: '#A0A0B0',
    error: '#FF6B6B',
};

export default function ProfileScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { user, loading } = useCurrentUser();
    const { signOut } = useAuth();

    if (loading) return <ProfileScreenSkeleton />;

    const renderMenuItem = (icon: string, label: string, isDestructive = false, onPress?: () => void) => (
        <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={onPress}
        >
            <View style={styles.menuItemLeft}>
                <View style={styles.iconCircle}>
                    <Feather name={icon as any} size={18} color={isDestructive ? COLORS.error : COLORS.white} />
                </View>
                <Text style={[styles.menuLabel, isDestructive && { color: COLORS.error }]}>
                    {label}
                </Text>
            </View>
            {!isDestructive && <Feather name="chevron-right" size={20} color={COLORS.textSecondary} />}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Profile */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarWrapper}>
                        {user?.avatar_url ? (
                            <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} />
                        ) : (
                            <View style={styles.initialsCircle}>
                                <Text style={styles.initialsText}>
                                    {user?.full_name?.charAt(0) || 'U'}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.name}>{user?.full_name || 'User'}</Text>
                    <Text style={styles.email}>{user?.email}</Text>

                    <View style={[styles.roleBadge, { backgroundColor: user?.role === 'admin' ? COLORS.gold : '#4A4A5A' }]}>
                        <Text style={styles.roleText}>
                            {user?.role === 'admin' ? 'ADMIN' : 'CLIENTE'}
                        </Text>
                    </View>
                </View>

                {/* Menu Section */}
                <View style={styles.menuSection}>
                    {renderMenuItem('calendar', 'Mis Turnos', false, () => navigation.navigate('MyBookings'))}
                    {renderMenuItem('bell', 'Notificaciones', false, () => Alert.alert('Próximamente', 'Notificaciones estarán disponibles pronto.'))}
                    {renderMenuItem('help-circle', 'Ayuda', false, () => Alert.alert('Ayuda', 'Soporte técnico: support@turnosync.com'))}
                    {renderMenuItem('log-out', 'Cerrar Sesión', true, () => signOut())}
                </View>

                <Text style={styles.versionText}>TurnoSync v1.1.0</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    profileHeader: { alignItems: 'center', paddingVertical: 40 },
    avatarWrapper: {
        width: 84,
        height: 84,
        borderRadius: 42,
        borderWidth: 2,
        borderColor: COLORS.gold,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        overflow: 'hidden',
    },
    avatarImg: { width: 80, height: 80, borderRadius: 40 },
    initialsCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.gold, justifyContent: 'center', alignItems: 'center' },
    initialsText: { color: COLORS.background, fontSize: 32, fontWeight: 'bold' },
    name: { color: COLORS.white, fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    email: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 16 },
    roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
    roleText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },
    menuSection: { paddingHorizontal: 20, marginTop: 10 },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
    iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    menuLabel: { color: COLORS.white, fontSize: 16, fontWeight: '500' },
    versionText: { textAlign: 'center', color: '#4A4A5A', fontSize: 12, marginVertical: 30 },
});
