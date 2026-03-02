import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useMyBookings } from '../../hooks/useMyBookings';
import { BookingsScreenSkeleton } from '../../components/ui/SkeletonLoader';
import { StatusBar } from 'expo-status-bar';

export default function MyBookingsScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { bookings, loading } = useMyBookings();
    const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

    const STATUS_COLORS: any = {
        pending: isDark ? '#FFA500' : '#E65100',
        confirmed: isDark ? '#4CAF50' : '#2E7D32',
        cancelled: isDark ? '#FF6B6B' : '#C62828',
    };

    const STATUS_BG: any = {
        pending: isDark ? 'rgba(255, 165, 0, 0.15)' : '#FFF3E0',
        confirmed: isDark ? 'rgba(76, 175, 80, 0.15)' : '#E8F5E9',
        cancelled: isDark ? 'rgba(255, 107, 107, 0.15)' : '#FFEBEE',
    };

    const now = new Date();
    const upcoming = bookings.filter(b => new Date(b.start_at) >= now && b.status !== 'cancelled');
    const past = bookings.filter(b => new Date(b.start_at) < now || b.status === 'cancelled');
    const data = tab === 'upcoming' ? upcoming : past;

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <BookingsScreenSkeleton />
            </View>
        );
    }

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.accentDim }]}>
                <Feather name="calendar" size={48} color={colors.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin turnos por ahora</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Reserva tu próximo corte</Text>
            <TouchableOpacity
                style={[styles.reserveBtn, { backgroundColor: colors.accent }]}
                onPress={() => navigation.navigate('Home')} // Redirigir a Home para buscar barberías
            >
                <Text style={[styles.reserveBtnText, { color: isDark ? '#0D0D1A' : '#FFFFFF' }]}>Reservar ahora</Text>
            </TouchableOpacity>
        </View>
    );

    const renderItem = ({ item }: any) => {
        const date = new Date(item.start_at);
        const day = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        return (
            <View style={[
                styles.bookingCard,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    elevation: isDark ? 0 : 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0 : 0.05,
                    shadowRadius: 4,
                }
            ]}>
                <View style={[styles.statusIndicator, { backgroundColor: STATUS_COLORS[item.status] || colors.accent }]} />
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.businessName, { color: colors.textPrimary }]} numberOfLines={1}>
                            {item.businesses?.name || 'Barbería'}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[item.status] || colors.accentDim }]}>
                            <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] || colors.accent }]}>
                                {item.status?.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.serviceName, { color: colors.textSecondary }]}>{item.services?.name || 'Servicio'}</Text>
                    <Text style={[styles.dateTime, { color: colors.accent }]}>{day} • {time}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Mis Turnos</Text>

            {/* Tab Selector */}
            <View style={[styles.tabContainer, { backgroundColor: colors.surfaceElevated }]}>
                <TouchableOpacity
                    style={[styles.tab, tab === 'upcoming' && { backgroundColor: colors.accent }]}
                    onPress={() => setTab('upcoming')}
                >
                    <Text style={[
                        styles.tabLabel,
                        { color: tab === 'upcoming' ? (isDark ? '#0D0D1A' : '#FFFFFF') : colors.textSecondary }
                    ]}>
                        Próximos
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, tab === 'past' && { backgroundColor: colors.accent }]}
                    onPress={() => setTab('past')}
                >
                    <Text style={[
                        styles.tabLabel,
                        { color: tab === 'past' ? (isDark ? '#0D0D1A' : '#FFFFFF') : colors.textSecondary }
                    ]}>
                        Historial
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    screenTitle: { fontSize: 28, fontWeight: 'bold', padding: 20 },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 4,
        marginBottom: 20
    },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    tabLabel: { fontSize: 14, fontWeight: '600' },
    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    bookingCard: {
        flexDirection: 'row',
        borderRadius: 16,
        marginBottom: 15,
        overflow: 'hidden',
        borderWidth: 1,
    },
    statusIndicator: { width: 6 },
    cardContent: { flex: 1, padding: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    businessName: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 10 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    serviceName: { fontSize: 14, marginBottom: 8 },
    dateTime: { fontSize: 13, fontWeight: '600' },
    emptyContainer: { alignItems: 'center', paddingVertical: 80 },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, marginBottom: 30 },
    reserveBtn: { paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12 },
    reserveBtnText: { fontSize: 16, fontWeight: 'bold' },
});
