import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileScreenSkeleton } from '../../components/ui/SkeletonLoader';

export default function ProfileScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { user, loading } = useCurrentUser();
    const { signOut } = useAuth();

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <ProfileScreenSkeleton />
            </View>
        );
    }

    const executeSignOut = async () => {
        setShowLogoutModal(false);
        try {
            await signOut();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
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
                {/* Header Profile */}
                <View style={styles.profileHeader}>
                    <View style={[
                        styles.avatarWrapper,
                        {
                            borderColor: colors.accent,
                            elevation: isDark ? 0 : 4,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: isDark ? 0 : 0.1,
                            shadowRadius: 8,
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
                    <Text style={[styles.name, { color: 'white' }]}>{user?.full_name || 'Usuario'}</Text>
                    <Text style={[styles.email, { color: '#A0A0B0' }]}>{user?.email}</Text>
                </View>

                {/* Menu Section */}
                <View style={styles.menuSection}>
                    {renderMenuItem('calendar', 'Mis Turnos', false, () => navigation.navigate('MyBookings'))}
                    {renderMenuItem('bell', 'Notificaciones', false, () => { })}
                    {renderMenuItem('help-circle', 'Ayuda', false, () => { })}

                    {/* Unique Logout Button Style */}
                    <TouchableOpacity
                        style={styles.logoutBtn}
                        onPress={() => setShowLogoutModal(true)}
                        activeOpacity={0.8}
                    >
                        <Feather name="log-out" size={20} color="#FF6B6B" />
                        <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Custom Logout Modal */}
            <Modal
                visible={showLogoutModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowLogoutModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconContainer}>
                            <Feather name="log-out" size={40} color="#FF6B6B" />
                        </View>

                        <Text style={styles.modalTitle}>¿Cerrar sesión?</Text>
                        <Text style={styles.modalSubtitle}>¿Seguro que deseas salir de tu cuenta?</Text>

                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => setShowLogoutModal(false)}
                        >
                            <Text style={styles.cancelBtnText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={executeSignOut}
                        >
                            <Text style={styles.confirmBtnText}>Sí, cerrar sesión</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImg: { width: '100%', height: '100%' },
    initialsCircle: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    initialsText: { fontSize: 32, fontWeight: 'bold' },
    name: { fontSize: 22, fontWeight: 'bold', marginTop: 12, textAlign: 'center' },
    email: { fontSize: 14, marginTop: 4, textAlign: 'center' },
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
    logoutBtn: {
        marginHorizontal: 20,
        marginTop: 24,
        marginBottom: 16,
        backgroundColor: 'rgba(255,107,107,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,107,107,0.3)',
        borderRadius: 14,
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    logoutBtnText: {
        color: '#FF6B6B',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#1A1A2E',
        borderRadius: 24,
        marginHorizontal: 32,
        padding: 28,
        alignItems: 'center',
        width: '85%',
    },
    modalIconContainer: {
        marginBottom: 16,
    },
    modalTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalSubtitle: {
        color: '#A0A0B0',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 28,
    },
    cancelBtn: {
        backgroundColor: '#252538',
        borderRadius: 12,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        width: '100%',
    },
    cancelBtnText: {
        color: 'white',
        fontSize: 16,
    },
    confirmBtn: {
        backgroundColor: '#FF6B6B',
        borderRadius: 12,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    confirmBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
