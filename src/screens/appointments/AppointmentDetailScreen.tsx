import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Linking, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../config/supabase';
import { formatFullDate, formatPrice, getStatusLabel, formatShortDate } from '../../utils/bookingHelpers';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { GradientButton } from '../../components/ui/GradientButton';

export default function AppointmentDetailScreen({ navigation, route }: any) {
    const { appointmentId } = route.params;
    const { colors, isDark } = useTheme();
    const { showToast } = useToast();
    const [appointment, setAppointment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    id, start_at, end_at, status, notes, price_cents,
                    services ( name, duration_minutes ),
                    staff ( name, photo_url ),
                    businesses ( name, address, phone, whatsapp, logo_url )
                `)
                .eq('id', appointmentId)
                .single();

            if (error) throw error;
            setAppointment(data);
        } catch (e) {
            console.error('[AppointmentDetail] Error:', e);
            showToast({ type: 'error', message: 'No se pudo cargar el detalle del turno.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [appointmentId]);

    const handleCancel = () => {
        setShowCancelModal(true);
    };

    const confirmCancel = async () => {
        setShowCancelModal(false);
        setCancelling(true);
        try {
            const { error: cancelError } = await supabase.rpc(
                'cancel_appointment',
                { p_appointment_id: appointmentId }
            );
            if (cancelError) throw cancelError;
            showToast({ type: 'success', message: 'Tu turno ha sido cancelado.' });
            navigation.goBack();
        } catch (e: any) {
            showToast({ type: 'error', message: e.message });
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.accent} />
            </SafeAreaView>
        );
    }

    if (!appointment) return null;

    const statusInfo = getStatusLabel(appointment.status);
    const isPast = new Date(appointment.start_at) < new Date();
    const canCancel = (appointment.status === 'pending' || appointment.status === 'confirmed') && !isPast;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <GradientHeader title="Detalle del turno" onBack={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.scroll}>
                <PremiumCard elevated style={styles.businessCard}>
                    {appointment.businesses?.logo_url ? (
                        <Image source={{ uri: appointment.businesses.logo_url }} style={styles.logo} />
                    ) : (
                        <View style={[styles.logoPlaceholder, { backgroundColor: colors.accentDim }]}>
                            <Feather name="scissors" size={30} color={colors.accent} />
                        </View>
                    )}
                    <View style={styles.businessInfo}>
                        <Text style={[styles.businessName, { color: colors.textPrimary }]}>{appointment.businesses?.name}</Text>
                        <Text style={[styles.businessAddress, { color: colors.textSecondary }]}>{appointment.businesses?.address}</Text>
                    </View>
                </PremiumCard>

                <PremiumCard elevated style={styles.detailSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ESTADO DEL TURNO</Text>
                        <StatusBadge status={appointment.status as any} />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.infoIcon}>
                            <Feather name="calendar" size={18} color={colors.accent} />
                        </View>
                        <View style={styles.infoTextCol}>
                            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Fecha y Hora</Text>
                            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{formatShortDate(appointment.start_at)}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoIcon}>
                            <Feather name="scissors" size={18} color={colors.accent} />
                        </View>
                        <View style={styles.infoTextCol}>
                            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Servicio</Text>
                            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{appointment.services?.name}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoIcon}>
                            <Feather name="user" size={18} color={colors.accent} />
                        </View>
                        <View style={styles.infoTextCol}>
                            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Barbero</Text>
                            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{appointment.staff?.name}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoIcon}>
                            <Feather name="dollar-sign" size={18} color={colors.accent} />
                        </View>
                        <View style={styles.infoTextCol}>
                            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Precio</Text>
                            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{formatPrice(appointment.price_cents)}</Text>
                        </View>
                    </View>

                    {appointment.notes ? (
                        <View style={styles.notesBox}>
                            <Text style={[styles.notesLabel, { color: colors.textMuted }]}>Notas para el barbero:</Text>
                            <Text style={[styles.notesText, { color: colors.textPrimary }]}>"{appointment.notes}"</Text>
                        </View>
                    ) : null}
                </PremiumCard>

                <View style={styles.contactRow}>
                    <TouchableOpacity
                        style={[styles.contactBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => Linking.openURL(`tel:${appointment.businesses?.phone}`)}
                    >
                        <Feather name="phone" size={20} color={colors.accent} />
                        <Text style={[styles.contactBtnText, { color: colors.textPrimary }]}>Llamar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.contactBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => {
                            const raw = appointment.businesses?.whatsapp ?? appointment.businesses?.phone ?? '';
                            // Limpiar: quitar +, espacios, guiones
                            const clean = raw.replace(/[^0-9]/g, '');
                            if (!clean) return;
                            Linking.openURL(`https://wa.me/${clean}`);
                        }}
                    >
                        <Feather name="message-circle" size={20} color="#25D366" />
                        <Text style={[styles.contactBtnText, { color: colors.textPrimary }]}>WhatsApp</Text>
                    </TouchableOpacity>
                </View>

                {canCancel && (
                    <GradientButton
                        label="CANCELAR TURNO"
                        onPress={handleCancel}
                        loading={cancelling}
                        disabled={cancelling}
                        variant="outline"
                        style={{ marginTop: 10, borderColor: colors.error }}
                    />
                )}
            </ScrollView>

            {/* Modal Cancelar Turno */}
            <Modal
                visible={showCancelModal}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setShowCancelModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
                        <View style={[styles.modalIconWrap, { backgroundColor: 'rgba(217,48,37,0.1)' }]}>
                            <Feather name="x-circle" size={32} color={colors.error} />
                        </View>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                            Cancelar turno
                        </Text>
                        <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                            Esta acción no se puede deshacer. El turno quedará cancelado.
                        </Text>
                        <TouchableOpacity
                            style={[styles.modalBtnPrimary, { backgroundColor: colors.error }]}
                            onPress={confirmCancel}
                            disabled={cancelling}
                        >
                            {cancelling
                                ? <ActivityIndicator color="#fff" size="small" />
                                : <Text style={styles.modalBtnPrimaryText}>Sí, cancelar turno</Text>
                            }
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalBtnSecondary}
                            onPress={() => setShowCancelModal(false)}
                        >
                            <Text style={[styles.modalBtnSecondaryText, { color: colors.textSecondary }]}>
                                No, mantener turno
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
    },
    scroll: {
        padding: 20,
        paddingBottom: 60,
    },
    businessCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1.5,
        gap: 15,
        marginBottom: 20,
    },
    logo: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    logoPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    businessInfo: {
        flex: 1,
    },
    businessName: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    businessAddress: {
        fontSize: 13,
        fontWeight: '500',
    },
    detailSection: {
        borderRadius: 24,
        borderWidth: 1.5,
        padding: 20,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginBottom: 15,
    },
    infoIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(201, 168, 76, 0.05)',
    },
    infoTextCol: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    notesBox: {
        marginTop: 10,
        padding: 15,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    notesLabel: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 6,
    },
    notesText: {
        fontSize: 14,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    contactRow: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    contactBtn: {
        flex: 1,
        height: 56,
        borderRadius: 18,
        borderWidth: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    contactBtnText: {
        fontSize: 15,
        fontWeight: '700',
    },
    cancelBtn: {
        height: 56,
        borderRadius: 18,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    cancelBtnText: {
        fontSize: 15,
        fontWeight: '800',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    modalBox: {
        borderRadius: 24,
        padding: 28,
        width: '100%',
        alignItems: 'center',
    },
    modalIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 28,
    },
    modalBtnPrimary: {
        width: '100%',
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalBtnPrimaryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    modalBtnSecondary: {
        width: '100%',
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBtnSecondaryText: {
        fontSize: 15,
        fontWeight: '600',
    }
});
