import React, { useState } from 'react';
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
        pending: '#C9A84C',      // Dorado principal
        confirmed: '#4CAF50',    // Verde éxito
        cancelled: '#FF6B6B',    // Rojo error
    };

    const STATUS_BG: any = {
        pending: 'rgba(201, 168, 76, 0.1)',
        confirmed: 'rgba(76, 175, 80, 0.1)',
        cancelled: 'rgba(255, 107, 107, 0.1)',
    };

    const now = new Date();
    const upcoming = bookings.filter(b => new Date(b.start_at) >= now && b.status !== 'cancelled');
    const past = bookings.filter(b => new Date(b.start_at) < now || b.status === 'cancelled');
    const data = tab === 'upcoming' ? upcoming : past;

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <BookingsScreenSkeleton paddingTop={insets.top} />
            </View>
        );
    }

    const renderHeader = () => {
        const count = tab === 'upcoming' ? upcoming.length : past.length;
        const subtitle = tab === 'upcoming'
            ? `${count} próximo(s)`
            : `${count} pasado(s)`;

        return (
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Mis Turnos</Text>
                <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
            </View>
        );
    };

    const renderTabs = () => (
        <View style={styles.tabWrapper}>
            <View style={[styles.tabContainer, { backgroundColor: colors.surfaceElevated }]}>
                <TouchableOpacity
                    style={[styles.tab, tab === 'upcoming' && { backgroundColor: colors.accent }]}
                    onPress={() => setTab('upcoming')}
                >
                    <View style={styles.tabLabelRow}>
                        <Text style={[
                            styles.tabLabel,
                            { color: tab === 'upcoming' ? (isDark ? '#0D0D1A' : '#FFFFFF') : colors.textSecondary }
                        ]}>
                            Próximos
                        </Text>
                        <View style={[
                            styles.badgePill,
                            { backgroundColor: tab === 'upcoming' ? (isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)') : colors.accentDim }
                        ]}>
                            <Text style={[
                                styles.badgeText,
                                { color: tab === 'upcoming' ? (isDark ? '#0D0D1A' : '#FFFFFF') : colors.accent }
                            ]}>
                                {upcoming.length}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, tab === 'past' && { backgroundColor: colors.accent }]}
                    onPress={() => setTab('past')}
                >
                    <View style={styles.tabLabelRow}>
                        <Text style={[
                            styles.tabLabel,
                            { color: tab === 'past' ? (isDark ? '#0D0D1A' : '#FFFFFF') : colors.textSecondary }
                        ]}>
                            Historial
                        </Text>
                        <View style={[
                            styles.badgePill,
                            { backgroundColor: tab === 'past' ? (isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)') : colors.accentDim }
                        ]}>
                            <Text style={[
                                styles.badgeText,
                                { color: tab === 'past' ? (isDark ? '#0D0D1A' : '#FFFFFF') : colors.accent }
                            ]}>
                                {past.length}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.accentDim }]}>
                <Feather name="calendar" size={48} color={colors.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin turnos por ahora</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Reserva tu próximo corte en segundos</Text>
            <TouchableOpacity
                style={[styles.reserveBtn, { backgroundColor: colors.accent }]}
                onPress={() => navigation.navigate('Home')}
            >
                <Text style={[styles.reserveBtnText, { color: isDark ? '#0D0D1A' : '#FFFFFF' }]}>Reservar ahora</Text>
            </TouchableOpacity>
        </View>
    );

    const renderItem = ({ item }: any) => {
        const date = new Date(item.start_at);

        // Formateo de fecha según requerimiento: Lunes 3 de marzo
        const dayRaw = date.toLocaleDateString('es-ES', { weekday: 'long' });
        const capitalizedDay = dayRaw.charAt(0).toUpperCase() + dayRaw.slice(1);
        const dayNum = date.getDate();
        const month = date.toLocaleDateString('es-ES', { month: 'long' });
        const formattedDate = `${capitalizedDay} ${dayNum} de ${month}`;

        // Formateo de hora: 10:30
        const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        const statusColor = STATUS_COLORS[item.status] || colors.accent;
        const statusBg = STATUS_BG[item.status] || colors.accentDim;

        return (
            <View style={[
                styles.bookingCard,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    elevation: isDark ? 0 : 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0 : 0.06,
                    shadowRadius: 4,
                }
            ]}>
                {/* Franja lateral de color */}
                <View style={[styles.statusStrip, { backgroundColor: statusColor }]} />

                <View style={styles.cardMainContent}>
                    {/* Icono circular a la izquierda */}
                    <View style={[styles.iconCircle, { backgroundColor: colors.accentDim }]}>
                        <Feather name="scissors" size={18} color={colors.accent} />
                    </View>

                    {/* Información central */}
                    <View style={styles.infoCol}>
                        <View style={styles.cardHeaderRow}>
                            <Text style={[styles.businessName, { color: colors.textPrimary }]} numberOfLines={1}>
                                {item.businesses?.name || 'Barbería'}
                            </Text>
                            {item.services?.price && (
                                <Text style={[styles.priceTag, { color: colors.textPrimary }]}>
                                    ${item.services.price.toLocaleString('es-AR')}
                                </Text>
                            )}
                        </View>

                        {item.businesses?.address && (
                            <Text style={[styles.addressText, { color: colors.textMuted }]} numberOfLines={1}>
                                {item.businesses.address}
                            </Text>
                        )}

                        <Text style={[styles.serviceText, { color: colors.textSecondary }]}>
                            {item.services?.name || 'Servicio'}
                            {item.services?.duration_minutes && ` · ${item.services.duration_minutes} min`}
                        </Text>

                        <View style={styles.cardFooterRow}>
                            <Text style={[styles.formattedDateText, { color: colors.accent }]}>
                                {formattedDate} · {time}
                            </Text>

                            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                                <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                                    {item.status === 'pending' ? 'Pendiente' :
                                        item.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <>
                        {renderHeader()}
                        {renderTabs()}
                    </>
                }
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 20, marginBottom: 8 },
    screenTitle: { fontSize: 28, fontWeight: '800' },
    screenSubtitle: { fontSize: 13, marginTop: 4 },
    tabWrapper: { paddingHorizontal: 20, marginVertical: 16 },
    tabContainer: {
        flexDirection: 'row',
        borderRadius: 14,
        padding: 4,
    },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    tabLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    tabLabel: { fontSize: 13, fontWeight: 'bold' },
    badgePill: {
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
    },
    badgeText: { fontSize: 10, fontWeight: 'bold' },
    listContent: { paddingBottom: 100 },
    bookingCard: {
        flexDirection: 'row',
        marginHorizontal: 16,
        borderRadius: 18,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
    },
    statusStrip: { width: 4 },
    cardMainContent: {
        flex: 1,
        flexDirection: 'row',
        padding: 14,
        alignItems: 'center'
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14
    },
    infoCol: { flex: 1 },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2
    },
    businessName: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 8 },
    priceTag: { fontSize: 15, fontWeight: '700' },
    addressText: { fontSize: 12, marginBottom: 4 },
    serviceText: { fontSize: 13, marginBottom: 8 },
    cardFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    formattedDateText: { fontSize: 13, fontWeight: '600', flex: 1 },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusBadgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    emptyContainer: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 40 },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
    emptySubtitle: { fontSize: 14, marginBottom: 30, textAlign: 'center' },
    reserveBtn: { paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12 },
    reserveBtnText: { fontSize: 16, fontWeight: 'bold' },
});
