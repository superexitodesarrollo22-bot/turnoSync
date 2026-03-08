import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { formatFullDate } from '../../utils/bookingHelpers';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { GradientButton } from '../../components/ui/GradientButton';

export default function BookingSuccessScreen({ navigation, route }: any) {
    const { appointment } = route.params;
    const { colors, isDark } = useTheme();

    const startAt = new Date(appointment.start_at);
    const dateLabel = formatFullDate(appointment.start_at.split('T')[0]);
    const timeLabel = startAt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.centerContent}>
                <View style={[styles.successCircle, { backgroundColor: colors.accentDim }]}>
                    <Feather name="check" size={50} color={colors.accent} />
                </View>

                <Text style={[styles.title, { color: colors.textPrimary }]}>¡Turno reservado!</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}> te esperamos el {dateLabel} a las {timeLabel} hs</Text>

                <PremiumCard elevated style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: colors.accentDim }]}>
                            <Feather name="scissors" size={20} color={colors.accent} />
                        </View>
                        <Text style={[styles.businessName, { color: colors.textPrimary }]}>Turno Confirmado</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.details}>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Servicio:</Text>
                            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{appointment.service_name}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Barbero:</Text>
                            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{appointment.staff_name}</Text>
                        </View>
                    </View>
                </PremiumCard>
            </View>

            <View style={styles.footer}>
                <GradientButton
                    label="Ver mis turnos"
                    onPress={() => navigation.navigate('MainTabs', { screen: 'MyBookings' })}
                />

                <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
                >
                    <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>Ir al inicio</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    successCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    card: {
        width: '100%',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 15,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    businessName: {
        fontSize: 18,
        fontWeight: '800',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 15,
    },
    details: {
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    footer: {
        padding: 30,
        gap: 15,
    },
    primaryBtn: {
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryBtnText: {
        fontSize: 16,
        fontWeight: '800',
    },
    secondaryBtn: {
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryBtnText: {
        fontSize: 15,
        fontWeight: '600',
    }
});
