import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useMyBookings } from '../../hooks/useMyBookings';
import { BookingsScreenSkeleton } from '../../components/ui/SkeletonLoader';
import { StatusBar } from 'expo-status-bar';

const STATUS_COLORS: any = {
    pending: '#FFA500', // warning/amarillo
    confirmed: '#4CAF50', // success/verde
    cancelled: '#FF6B6B', // error/rojo
};

const COLORS = {
    background: '#0D0D1A',
    surface: '#1A1A2E',
    border: '#2A2A3E',
    gold: '#C9A84C',
    white: '#FFFFFF',
    textSecondary: '#A0A0B0',
};

export default function MyBookingsScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { bookings, loading } = useMyBookings();
    const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

    const now = new Date();
    const upcoming = bookings.filter(b => new Date(b.start_at) >= now && b.status !== 'cancelled');
    const past = bookings.filter(b => new Date(b.start_at) < now || b.status === 'cancelled');
    const data = tab === 'upcoming' ? upcoming : past;

    if (loading) return <BookingsScreenSkeleton />;

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
                <Feather name="calendar" size={48} color={COLORS.gold} />
            </View>
            <Text style={styles.emptyTitle}>Sin turnos por ahora</Text>
            <Text style={styles.emptySubtitle}>Reserva tu próximo corte</Text>
            <TouchableOpacity
                style={styles.reserveBtn}
                onPress={() => navigation.navigate('BusinessList')}
            >
                <Text style={styles.reserveBtnText}>Reservar ahora</Text>
            </TouchableOpacity>
        </View>
    );

    const renderItem = ({ item }: any) => {
        const date = new Date(item.start_at);
        const day = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        return (
            <View style={styles.bookingCard}>
                <View style={[styles.statusIndicator, { backgroundColor: STATUS_COLORS[item.status] || COLORS.gold }]} />
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.businessName} numberOfLines={1}>
                            {item.businesses?.name || 'Barbería'}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] || COLORS.gold) + '20' }]}>
                            <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] || COLORS.gold }]}>
                                {item.status?.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.serviceName}>{item.services?.name || 'Servicio'}</Text>
                    <Text style={styles.dateTime}>{day} • {time}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="light" />
            <Text style={styles.screenTitle}>Mis Turnos</Text>

            {/* Tab Selector */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, tab === 'upcoming' && styles.activeTab]}
                    onPress={() => setTab('upcoming')}
                >
                    <Text style={[styles.tabLabel, tab === 'upcoming' && styles.activeTabLabel]}>Próximos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, tab === 'past' && styles.activeTab]}
                    onPress={() => setTab('past')}
                >
                    <Text style={[styles.tabLabel, tab === 'past' && styles.activeTabLabel]}>Historial</Text>
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
    container: { flex: 1, backgroundColor: COLORS.background },
    screenTitle: { color: COLORS.white, fontSize: 28, fontWeight: 'bold', padding: 20 },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 4,
        marginBottom: 20
    },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    activeTab: { backgroundColor: COLORS.gold },
    tabLabel: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
    activeTabLabel: { color: COLORS.background },
    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    bookingCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        marginBottom: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statusIndicator: { width: 6 },
    cardContent: { flex: 1, padding: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    businessName: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 10 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    serviceName: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 8 },
    dateTime: { color: COLORS.gold, fontSize: 13, fontWeight: '600' },
    emptyContainer: { alignItems: 'center', paddingVertical: 80 },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(201, 168, 76, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    emptyTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    emptySubtitle: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 30 },
    reserveBtn: { backgroundColor: COLORS.gold, paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12 },
    reserveBtnText: { color: COLORS.background, fontSize: 16, fontWeight: 'bold' },
});
