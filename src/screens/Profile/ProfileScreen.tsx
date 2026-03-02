import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { AppLogo } from '../../components/ui/AppLogo';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileScreenSkeleton } from '../../components/ui/SkeletonLoader';

export default function ProfileScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { user, loading } = useCurrentUser();
    const { signOut } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <ProfileScreenSkeleton />
            </View>
        );
    }

    const handleSignOut = () => {
        Alert.alert(
            'Cerrar sesión',
            '¿Estás seguro que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar sesión',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo cerrar sesión. Intenta de nuevo.');
                        }
                    }
                }
            ]
        );
    };

    const renderMenuItem = (icon: string, label: string, isDestructive = false, onPress?: () => void) => (
        <TouchableOpacity
            style={[
                styles.menuItem,
                {
                    backgroundColor: colors.surface,
                    borderBottomColor: colors.divider
                }
            ]}
            activeOpacity={0.7}
            onPress={onPress}
        >
            <View style={styles.menuItemLeft}>
                <View style={[
                    styles.iconCircle,
                    {
                        backgroundColor: isDestructive ? 'rgba(217,48,37,0.1)' : colors.accentDim
                    }
                ]}>
                    <Feather
                        name={icon as any}
                        size={18}
                        color={isDestructive ? colors.error : colors.accent}
                    />
                </View>
                <Text style={[
                    styles.menuLabel,
                    { color: isDestructive ? colors.error : colors.textPrimary }
                ]}>
                    {label}
                </Text>
            </View>
            {!isDestructive && <Feather name="chevron-right" size={20} color={colors.textMuted} />}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Branding Header */}
                <View style={styles.brandingHeader}>
                    <AppLogo size={40} iconSize={18} />
                    <Text style={[styles.brandingTitle, { color: colors.textPrimary }]}>TurnoSync</Text>
                </View>

                {/* Header Profile */}
                <View style={styles.profileHeader}>
                    <View style={[
                        styles.avatarWrapper,
                        {
                            borderColor: colors.accent,
                            elevation: isDark ? 0 : 3,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: isDark ? 0 : 0.1,
                            shadowRadius: 4,
                        }
                    ]}>
                        {user?.avatar_url ? (
                            <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} />
                        ) : (
                            <View style={[styles.initialsCircle, { backgroundColor: colors.accent }]}>
                                <Text style={[styles.initialsText, { color: isDark ? colors.background : '#FFFFFF' }]}>
                                    {user?.full_name?.charAt(0) || 'U'}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.full_name || 'Usuario'}</Text>
                    <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>

                    <View style={[styles.roleBadge, { backgroundColor: colors.accent }]}>
                        <Text style={[styles.roleText, { color: isDark ? colors.background : '#FFFFFF' }]}>
                            {user?.role === 'admin' ? 'ADMIN' : 'CLIENTE'}
                        </Text>
                    </View>
                </View>

                {/* Menu Section */}
                <View style={styles.menuSection}>
                    {renderMenuItem('calendar', 'Mis Turnos', false, () => navigation.navigate('MyBookings'))}
                    {renderMenuItem('bell', 'Notificaciones', false, () => Alert.alert('Próximamente', 'Notificaciones estarán disponibles pronto.'))}
                    {renderMenuItem('help-circle', 'Ayuda', false, () => Alert.alert('Ayuda', 'Soporte técnico: support@turnosync.com'))}
                    {renderMenuItem('log-out', 'Cerrar sesión', true, handleSignOut)}
                </View>


                <Text style={[styles.versionText, { color: colors.textMuted }]}>TurnoSync v1.1.0</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    profileHeader: { alignItems: 'center', paddingVertical: 40 },
    avatarWrapper: {
        width: 84,
        height: 84,
        borderRadius: 42,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        overflow: 'hidden',
    },
    avatarImg: { width: 80, height: 80, borderRadius: 40 },
    initialsCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
    initialsText: { fontSize: 32, fontWeight: 'bold' },
    name: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    email: { fontSize: 14, marginBottom: 16 },
    roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
    roleText: { fontSize: 10, fontWeight: 'bold' },
    menuSection: { marginTop: 10 },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
    iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    menuLabel: { fontSize: 16, fontWeight: '500' },
    versionText: { textAlign: 'center', fontSize: 12, marginVertical: 30 },
    brandingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 12,
    },
    brandingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
