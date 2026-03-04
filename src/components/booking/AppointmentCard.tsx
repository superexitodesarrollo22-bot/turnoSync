import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { formatShortDate, getStatusLabel } from '../../utils/bookingHelpers';

interface AppointmentCardProps {
    appointment: any;
    onPress: () => void;
}

export const AppointmentCard = ({ appointment, onPress }: AppointmentCardProps) => {
    const { colors, isDark } = useTheme();
    const status = getStatusLabel(appointment.status);

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border
                }
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={[styles.statusStripe, { backgroundColor: status.color }]} />

            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.businessInfo}>
                        {appointment.businesses?.logo_url ? (
                            <Image source={{ uri: appointment.businesses.logo_url }} style={styles.logo} />
                        ) : (
                            <View style={[styles.logoPlaceholder, { backgroundColor: colors.accentDim }]}>
                                <Feather name="scissors" size={16} color={colors.accent} />
                            </View>
                        )}
                        <Text style={[styles.businessName, { color: colors.textPrimary }]} numberOfLines={1}>
                            {appointment.businesses?.name}
                        </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: status.color + '20' }]}>
                        <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
                    </View>
                </View>

                <View style={styles.body}>
                    <Text style={[styles.serviceName, { color: colors.textSecondary }]}>
                        {appointment.services?.name} · {appointment.staff?.name}
                    </Text>
                    <View style={styles.dateRow}>
                        <Feather name="calendar" size={12} color={colors.textMuted} style={{ marginRight: 6 }} />
                        <Text style={[styles.dateText, { color: colors.textMuted }]}>
                            {formatShortDate(appointment.start_at)}
                        </Text>
                    </View>
                </View>
            </View>

            <Feather name="chevron-right" size={20} color={colors.textMuted} style={styles.chevron} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 18,
        borderWidth: 1,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        minHeight: 100,
    },
    statusStripe: {
        width: 5,
        height: '100%',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    businessInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    logo: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    logoPlaceholder: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    businessName: {
        fontSize: 16,
        fontWeight: '700',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    body: {
        gap: 4,
    },
    serviceName: {
        fontSize: 14,
        fontWeight: '600',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 13,
        fontWeight: '500',
    },
    chevron: {
        marginRight: 12,
    },
});
