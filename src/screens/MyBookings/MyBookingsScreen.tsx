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
import { EmptyState } from '../../components/ui/EmptyState';
import FadeInView from '../../components/ui/FadeInView';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { StatusBadge } from '../../components/ui/StatusBadge';

// NOTA: el hook useMyBookings retorna bookings con la estructura:
// appointments.* + businesses(name, address) + services(name, price_cents, duration_minutes)

const STATUS_LABEL: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
    completed: 'Completado',
};

const STATUS_COLORS: Record<string, string> = {
    pending: '#C9A84C',
    confirmed: '#4CAF50',
    cancelled: '#FF6B6B',
    completed: '#7B8FA1',
};

const STATUS_BG: Record<string, string> = {
    pending: 'rgba(201, 168, 76, 0.12)',
    confirmed: 'rgba(76, 175, 80, 0.12)',
    cancelled: 'rgba(255, 107, 107, 0.12)',
    completed: 'rgba(123, 143, 161, 0.12)',
};

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function formatBookingDate(isoString: string): { day: string; time: string } {
    try {
        const d = new Date(isoString);
        const weekday = WEEKDAYS[d.getDay()];
        const dayNum = d.getDate();
        const month = MONTHS[d.getMonth()];
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        return { day: `${weekday} ${dayNum} ${month}`, time: `${hours}:${mins}` };
    } catch {
        return { day: '—', time: '—' };
    }
}

function formatPrice(cents: number | null | undefined): string | null {
    if (cents == null || isNaN(cents)) return null;
    const amount = cents / 100;
    return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
}

export default function MyBookingsScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { bookings, loading, cancelBooking } = useMyBookings();
    const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

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

    const renderEmpty = () => (
        <EmptyState
            icon="calendar-outline"
            title={tab === 'upcoming' ? 'Sin reservas aún' : 'Sin historial aún'}
            subtitle={tab === 'upcoming' ? 'Reserva tu primer turno y aparecerá aquí.' : 'Tus turnos pasados aparecerán aquí.'}
            actionLabel={tab === 'upcoming' ? 'Explorar barberos' : undefined}
            onAction={tab === 'upcoming' ? () => navigation.navigate('Home') : undefined}
        />
    );

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        const { day, time } = formatBookingDate(item.start_at);
        const businessName: string = item.businesses?.name ?? 'Barbería';
        const businessAddress: string | null = item.businesses?.address ?? null;
        const serviceName: string = item.services?.name ?? 'Servicio';
        const durationMin: number | null = item.services?.duration_minutes ?? null;
        const priceCents: number | null = item.services?.price_cents ?? null;
        const status: string = item.status ?? 'pending';
        const statusColor = STATUS_COLORS[status] ?? '#C9A84C';
        const statusBg = STATUS_BG[status] ?? 'rgba(201,168,76,0.12)';
        const statusLabel = STATUS_LABEL[status] ?? status;
        const priceFormatted = formatPrice(priceCents);

        return (
            <FadeInView delay={index * 80}>
                <PremiumCard
                    style={{
                        padding: 0,
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 12,
                        minHeight: 86,
                    }}
                >
                    <View style={[styles.statusStripe, { backgroundColor: statusColor }]} />

                    <View style={[styles.iconCircle, { backgroundColor: colors.accentDim }]}>
                        <Feather name="scissors" size={18} color={colors.accent} />
                    </View>

                    <View style={styles.cardBody}>
                        <Text style={[styles.businessName, { color: colors.textPrimary }]} numberOfLines={1}>
                            {businessName}
                        </Text>
                        {businessAddress ? (
                            <Text style={[styles.addressText, { color: colors.textMuted }]} numberOfLines={1}>
                                {businessAddress}
                            </Text>
                        ) : null}
                        <Text style={[styles.serviceText, { color: colors.textSecondary }]} numberOfLines={1}>
                            {serviceName}{durationMin ? ` · ${durationMin} min` : ''}
                        </Text>
                        <View style={styles.dateRow}>
                            <Feather name="clock" size={11} color={colors.accent} style={{ marginRight: 4 }} />
                            <Text style={[styles.dateText, { color: colors.accent }]}>
                                {day} · {time}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.cardRight}>
                        {priceFormatted ? (
                            <Text style={[styles.priceText, { color: colors.textPrimary }]}>
                                {priceFormatted}
                            </Text>
                        ) : null}
                        <StatusBadge status={status as any} size="sm" />
                    </View>
                </PremiumCard>
            </FadeInView>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <View style={[styles.headerSection, { paddingTop: insets.top + 16 }]}>
                <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Mis Turnos</Text>
                <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
                    {tab === 'upcoming'
                        ? `${upcoming.length} próximo${upcoming.length !== 1 ? 's' : ''}`
                        : `${past.length} en historial`}
                </Text>
            </View>

            <View style={[styles.tabContainer, { backgroundColor: colors.surfaceElevated }]}>
                <TouchableOpacity
                    style={[styles.tab, tab === 'upcoming' && { backgroundColor: colors.accent }]}
                    onPress={() => setTab('upcoming')}
                    activeOpacity={0.8}
                >
                    <Text style={[
                        styles.tabLabel,
                        { color: tab === 'upcoming' ? (isDark ? '#0D0D1A' : '#FFFFFF') : colors.textSecondary }
                    ]}>
                        Próximos{upcoming.length > 0 ? `  ${upcoming.length}` : ''}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, tab === 'past' && { backgroundColor: colors.accent }]}
                    onPress={() => setTab('past')}
                    activeOpacity={0.8}
                >
                    <Text style={[
                        styles.tabLabel,
                        { color: tab === 'past' ? (isDark ? '#0D0D1A' : '#FFFFFF') : colors.textSecondary }
                    ]}>
                        Historial{past.length > 0 ? `  ${past.length}` : ''}
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={data}
                keyExtractor={(item) => item.id ?? Math.random().toString()}
                renderItem={renderItem}
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.listContent,
                    data.length === 0 && styles.listEmpty,
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerSection: {
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    screenSubtitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 4,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 13,
        fontWeight: '700',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
        paddingTop: 4,
    },
    listEmpty: {
        flexGrow: 1,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 18,
        borderWidth: 1,
        marginBottom: 12,
        overflow: 'hidden',
        minHeight: 86,
    },
    statusStripe: {
        width: 4,
        alignSelf: 'stretch',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
        marginRight: 12,
        flexShrink: 0,
    },
    cardBody: {
        flex: 1,
        paddingVertical: 14,
        paddingRight: 8,
        gap: 3,
    },
    businessName: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 1,
    },
    addressText: {
        fontSize: 11,
        fontWeight: '400',
    },
    serviceText: {
        fontSize: 13,
        fontWeight: '500',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    dateText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardRight: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 14,
        paddingVertical: 14,
        gap: 8,
        flexShrink: 0,
    },
    priceText: {
        fontSize: 14,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingTop: 60,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 28,
        lineHeight: 20,
    },
    reserveBtn: {
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 14,
    },
    reserveBtnText: {
        fontSize: 15,
        fontWeight: '700',
    },
});
