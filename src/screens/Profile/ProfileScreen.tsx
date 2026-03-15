import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Modal,
    Alert,
    Linking,
    Share,
    Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { ProfileScreenSkeleton } from '../../components/ui/SkeletonLoader';

export default function ProfileScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { user, loading } = useCurrentUser();
    const { signOut } = useAuth();
    const { showToast } = useToast();

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showNotifsModal, setShowNotifsModal] = useState(false);

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <ProfileScreenSkeleton />
            </View>
        );
    }

    const handleSignOut = () => setShowLogoutModal(true);

    const handleOpenURL = (url: string) => {
        Linking.openURL(url).catch(() =>
            showToast({ type: 'error', message: 'No se pudo abrir el enlace.' })
        );
    };

    const [notifsEnabled, setNotifsEnabled] = useState(true);

    useEffect(() => {
        AsyncStorage.getItem('notifs_enabled').then(val => {
            if (val !== null) setNotifsEnabled(val === 'true');
        });
    }, []);

    const handleToggleNotifs = async (val: boolean) => {
        setNotifsEnabled(val);
        await AsyncStorage.setItem('notifs_enabled', val.toString());
        showToast({
            type: 'success',
            message: val ? 'Notificaciones activadas' : 'Notificaciones desactivadas',
        });
    };

    const handleNotificaciones = () => setShowNotifsModal(true);

    const renderSectionTitle = (title: string) => (
        <Text style={[styles.sectionTitleText, { color: colors.textMuted }]}>
            {title.toUpperCase()}
        </Text>
    );

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
                            <Image
                                source={{ uri: user.avatar_url }}
                                style={styles.avatarImg}
                                onError={() => { }}
                            />
                        ) : (
                            <View style={[styles.initialsCircle, { backgroundColor: colors.accent }]}>
                                <Text style={[styles.initialsText, { color: isDark ? colors.background : '#FFFFFF' }]}>
                                    {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.name, { color: colors.textPrimary }]}>
                        {user?.full_name || 'Usuario'}
                    </Text>
                    <Text style={[styles.email, { color: '#A0A0B0' }]}>{user?.email}</Text>
                </View>

                {/* Menu Sections */}
                {renderSectionTitle('Configuración')}
                <View style={styles.menuSection}>
                    {renderMenuItem('share-2', 'Compartir TurnoSync', false, () =>
                        Share.share({
                            message: 'Reserva tu turno en segundos con TurnoSync https://turnosync.app',
                            title: 'TurnoSync',
                        })
                    )}
                    {renderMenuItem('bell', 'Notificaciones', false, handleNotificaciones)}
                    {renderMenuItem('shield', 'Política de privacidad', false, () =>
                        handleOpenURL('https://zyntechsolutions.netlify.app/privacidad_turno')
                    )}
                    {renderMenuItem('file-text', 'Términos y condiciones', false, () =>
                        handleOpenURL('https://zyntechsolutions.netlify.app/condiciones_turno')
                    )}
                </View>

                <View style={styles.menuSection}>
                    {renderMenuItem('log-out', 'Cerrar sesión', true, () => setShowLogoutModal(true))}
                </View>
            </ScrollView>

            {/* Logout Modal */}
            <Modal visible={showLogoutModal} transparent animationType="fade" statusBarTranslucent>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
                    <View style={[{ backgroundColor: colors.surface, borderRadius: 20, padding: 28, width: '100%', alignItems: 'center' }]}>
                        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(217,48,37,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                            <Feather name="log-out" size={26} color={colors.error} />
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 }}>Cerrar sesión</Text>
                        <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 28 }}>¿Estás seguro que deseas cerrar sesión?</Text>
                        <TouchableOpacity
                            style={{ width: '100%', backgroundColor: colors.error, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12 }}
                            onPress={async () => {
                                setShowLogoutModal(false);
                                try { await signOut(); } catch { showToast({ type: 'error', message: 'No se pudo cerrar sesión.' }); }
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Cerrar sesión</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ width: '100%', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
                            onPress={() => setShowLogoutModal(false)}
                        >
                            <Text style={{ color: colors.textSecondary, fontSize: 15 }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal Notificaciones */}
            <Modal
                visible={showNotifsModal}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setShowNotifsModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
                        <View style={[styles.modalIconWrap, { backgroundColor: colors.accentDim }]}>
                            <Feather name="bell" size={28} color={colors.accent} />
                        </View>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                            Notificaciones
                        </Text>

                        {/* Toggle principal */}
                        <View style={[styles.notifRow, { borderColor: colors.divider }]}>
                            <View style={styles.notifRowLeft}>
                                <Feather name="bell" size={18} color={colors.accent} style={{ marginRight: 12 }} />
                                <View>
                                    <Text style={[styles.notifRowTitle, { color: colors.textPrimary }]}>
                                        Recibir notificaciones
                                    </Text>
                                    <Text style={[styles.notifRowSub, { color: colors.textSecondary }]}>
                                        Recordatorios de tus turnos
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={notifsEnabled}
                                onValueChange={async (val) => {
                                    setNotifsEnabled(val);
                                    await AsyncStorage.setItem('notifs_enabled', val.toString());
                                }}
                                trackColor={{ false: colors.divider, true: colors.accent }}
                                thumbColor="#fff"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.notifSettingsBtn, { borderColor: colors.border }]}
                            onPress={() => { setShowNotifsModal(false); Linking.openSettings(); }}
                        >
                            <Feather name="settings" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                            <Text style={[styles.notifSettingsBtnText, { color: colors.textSecondary }]}>
                                Configuración del sistema
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalBtnPrimary, { backgroundColor: colors.accent, marginTop: 8 }]}
                            onPress={() => setShowNotifsModal(false)}
                        >
                            <Text style={[styles.modalBtnPrimaryText, { color: '#0D0D1A' }]}>Listo</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
    menuSection: { marginTop: 4 },
    sectionTitleText: {
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 8,
        letterSpacing: 0.5,
    },
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
    modalIconWrap: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    notifRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        marginBottom: 16,
    },
    notifRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    notifRowTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    notifRowSub: {
        fontSize: 12,
        marginTop: 2,
    },
    notifSettingsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        width: '100%',
        marginBottom: 16,
    },
    notifSettingsBtnText: {
        fontSize: 14,
        fontWeight: '500',
    },
    modalBtnPrimary: {
        width: '100%',
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBtnPrimaryText: {
        fontSize: 16,
        fontWeight: '700',
    },
    modalBox: {
        borderRadius: 24,
        padding: 28,
        width: '100%',
        alignItems: 'center',
    },
});
