import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useMyBookings } from '../../hooks/useMyBookings';
import { BookingListSkeleton } from '../../components/skeletons/BookingListSkeleton';

const STATUS_COLORS: any = {
    pending: '#F39C12', confirmed: '#2ECC71', cancelled: '#E74C3C', completed: '#5B86E5', no_show: '#95A5A6',
};
const STATUS_LABELS: any = {
    pending: 'Pendiente', confirmed: 'Confirmado', cancelled: 'Cancelado', completed: 'Completado', no_show: 'No presentado',
};

export default function MyBookingsScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const { bookings, loading, cancelBooking } = useMyBookings();
    const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

    const now = new Date();
    const upcoming = bookings.filter(b => new Date(b.start_at) >= now && b.status !== 'cancelled');
    const past = bookings.filter(b => new Date(b.start_at) < now || b.status === 'cancelled');
    const data = tab === 'upcoming' ? upcoming : past;

    const canCancel = (startAt: string) => {
        const diff = new Date(startAt).getTime() - now.getTime();
        return diff > 72 * 60 * 60 * 1000;
    };

    const handleCancel = (id: string) => {
        Alert.alert('Cancelar turno', '¿Seguro que deseas cancelar este turno?', [
            { text: 'No', style: 'cancel' },
            { text: 'Sí, cancelar', style: 'destructive', onPress: () => cancelBooking(id) },
        ]);
    };

    if (loading) return <BookingListSkeleton />;

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Mis turnos</Text>

            {/* Tabs */}
            <View style={[styles.tabs, { backgroundColor: colors.surfaceElevated }]}>
                {(['upcoming', 'past'] as const).map(t => (
                    <TouchableOpacity key={t} onPress={() => setTab(t)}
                        style={[styles.tab, tab === t && { backgroundColor: colors.accent }]}>
                        <Text style={[styles.tabText, { color: tab === t ? '#0D0D1A' : colors.textSecondary }]}>
                            {t === 'upcoming' ? `Próximos (${upcoming.length})` : `Historial (${past.length})`}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={data}
                keyExtractor={i => i.id}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={{ fontSize: 40, marginBottom: 12 }}>📅</Text>
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                            {tab === 'upcoming' ? 'No tienes turnos próximos' : 'Sin historial de turnos'}
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                        <View style={styles.cardHeader}>
                            <Text style={[styles.bizName, { color: colors.textPrimary }]} numberOfLines={1}>{item.businesses?.name}</Text>
                            <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
                                <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>{STATUS_LABELS[item.status]}</Text>
                            </View>
                        </View>
                        <Text style={[styles.service, { color: colors.textSecondary }]}>{item.services?.name}</Text>
                        <View style={styles.infoRow}>
                            <Feather name="calendar" size={13} color={colors.accent} />
                            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                                {new Date(item.start_at).toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </Text>
                            <Feather name="clock" size={13} color={colors.accent} style={{ marginLeft: 12 }} />
                            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                                {new Date(item.start_at).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                        {tab === 'upcoming' && item.status !== 'cancelled' && (
                            canCancel(item.start_at)
                                ? <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.error }]} onPress={() => handleCancel(item.id)}>
                                    <Text style={[styles.cancelText, { color: colors.error }]}>Cancelar turno</Text>
                                </TouchableOpacity>
                                : <Text style={[styles.noCancelText, { color: colors.textMuted }]}>
                                    ⚠️ No puedes cancelar con menos de 72h de anticipación. Contacta al local.
                                </Text>
                        )}
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    title: { fontSize: 26, fontWeight: '800', paddingHorizontal: 20, marginBottom: 20 },
    tabs: { flexDirection: 'row', marginHorizontal: 20, borderRadius: 14, padding: 4, marginBottom: 20 },
    tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
    tabText: { fontSize: 13, fontWeight: '600' },
    card: { borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 14 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    bizName: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
    badgeText: { fontSize: 11, fontWeight: '600' },
    service: { fontSize: 14, marginBottom: 10 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
    infoText: { fontSize: 13 },
    cancelBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
    cancelText: { fontSize: 14, fontWeight: '600' },
    noCancelText: { fontSize: 12, lineHeight: 18 },
    empty: { alignItems: 'center', paddingTop: 80 },
    emptyText: { fontSize: 15 },
});
