import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useBookAppointment } from '../../hooks/useBookAppointment';
import { formatFullDate, formatPrice } from '../../utils/bookingHelpers';
import { useToast } from '../../hooks/useToast';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { GradientButton } from '../../components/ui/GradientButton';

export default function BookingConfirmScreen({ navigation, route }: any) {
    const { businessId, businessName, service, staff, date, slot } = route.params;
    const { colors, isDark } = useTheme();
    const { bookAppointment, loading, error } = useBookAppointment();
    const insets = useSafeAreaInsets();
    const [notes, setNotes] = useState('');
    const { showToast } = useToast();

    const handleConfirm = async () => {
        const result = await bookAppointment({
            businessId,
            serviceId: service.id,
            staffId: staff.id,
            startAt: slot.slot_start,
            notes: notes.trim()
        });

        if (result) {
            showToast({ type: 'success', message: 'Turno reservado exitosamente' });
            // Ir directo a Mis Turnos limpiando el stack del wizard
            navigation.reset({
                index: 0,
                routes: [{
                    name: 'MainTabs',
                    params: { screen: 'MyBookings' }
                }]
            });
        } else if (error) {
            showToast({ type: 'error', message: error });
        }
    };

    return (
        <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Confirmar reserva</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Paso final</Text>
                </View>
                <View style={styles.stepBadge}>
                    <Text style={styles.stepText}>5/5</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <PremiumCard elevated style={{ backgroundColor: colors.surface }}>
                    <View style={styles.summaryTitleRow}>
                        <Feather name="info" size={18} color={colors.accent} />
                        <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>RESUMEN DE TU TURNO</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Barbería</Text>
                        <Text style={[styles.rowValue, { color: colors.textPrimary }]}>{businessName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Servicio</Text>
                        <Text style={[styles.rowValue, { color: colors.textPrimary }]}>{service.name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Barbero</Text>
                        <Text style={[styles.rowValue, { color: colors.textPrimary }]}>{staff.name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Fecha</Text>
                        <Text style={[styles.rowValue, { color: colors.textPrimary }]}>{formatFullDate(date)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Horario</Text>
                        <Text style={[styles.rowValue, { color: colors.accent }]}>{slot.label} hs</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={[styles.priceLabel, { color: colors.textPrimary }]}>Total a pagar</Text>
                        <Text style={[styles.priceValue, { color: colors.textPrimary }]}>{formatPrice(service.price_cents)}</Text>
                    </View>
                </PremiumCard>

                <View style={styles.notesSection}>
                    <Text style={[styles.notesHeader, { color: colors.textSecondary }]}>NOTAS PARA EL BARBERO (OPCIONAL)</Text>
                    <TextInput
                        style={[styles.input, {
                            backgroundColor: colors.surface,
                            color: colors.textPrimary,
                            borderColor: colors.border
                        }]}
                        placeholder="Ej: Quiero un degradado bajo con raya al costado..."
                        placeholderTextColor={colors.textMuted}
                        multiline
                        numberOfLines={3}
                        maxLength={200}
                        value={notes}
                        onChangeText={setNotes}
                    />
                    <Text style={[styles.charCount, { color: colors.textMuted }]}>{notes.length}/200</Text>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.surface }]}>
                <GradientButton
                    label="CONFIRMAR RESERVA"
                    onPress={handleConfirm}
                    loading={loading}
                    disabled={loading}
                    variant="primary"
                />
                <TouchableOpacity
                    style={styles.cancelLink}
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Volver y cambiar</Text>
                </TouchableOpacity>
            </View>
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
        paddingHorizontal: 20,
        paddingVertical: 15,
        gap: 15,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    stepBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#C9A84C',
    },
    stepText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#0D0D1A',
    },
    scroll: {
        padding: 20,
        paddingBottom: 150,
    },
    summaryCard: {
        borderRadius: 24,
        borderWidth: 1.5,
        padding: 20,
        gap: 12,
    },
    summaryTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 5,
    },
    summaryTitle: {
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 1,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginVertical: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    rowValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    priceLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    priceValue: {
        fontSize: 20,
        fontWeight: '800',
    },
    notesSection: {
        marginTop: 30,
    },
    notesHeader: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    input: {
        borderRadius: 16,
        borderWidth: 1.5,
        padding: 15,
        height: 100,
        textAlignVertical: 'top',
        fontSize: 14,
        fontWeight: '500',
    },
    charCount: {
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'right',
        marginTop: 6,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        gap: 10,
    },
    confirmBtn: {
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmText: {
        fontSize: 16,
        fontWeight: '800',
    },
    cancelLink: {
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '600',
    }
});
