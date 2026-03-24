import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAvailableSlots } from '../../hooks/useAvailableSlots';
import { SlotButton } from '../../components/booking/SlotButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { GradientButton } from '../../components/ui/GradientButton';
import { formatFullDate } from '../../utils/bookingHelpers';

export default function BookingSelectSlotScreen({ navigation, route }: any) {
    const { businessId, businessName, service, staff, date } = route.params;
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { slots, loading, error, refetch } = useAvailableSlots({
        businessId,
        date,
        serviceId: service.id,
        staffId: staff.id
    });

    const handleSelect = (slot: any, staffId: string, staffName: string) => {
        navigation.navigate('BookingConfirm', {
            businessId,
            businessName,
            service,
            staff: { id: staffId, name: staffName },
            date,
            slot
        });
    };

    if (loading) {
        return (
        <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Buscando horarios disponibles...</Text>
            </SafeAreaView>
        );
    }

    if (!loading && slots.length === 0) {
        return (
            <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <View style={styles.headerText}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>No hay horarios</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{formatFullDate(date)}</Text>
                    </View>
                </View>
                <EmptyState
                    icon="calendar-outline"
                    title="Día sin disponibilidad"
                    subtitle="No hay horarios disponibles para este día. Prueba con otra fecha."
                />
                <View style={{ padding: 20 }}>
                    <GradientButton
                        label="Cambiar fecha"
                        onPress={() => navigation.goBack()}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Elige un horario</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{formatFullDate(date)}</Text>
                </View>
                <View style={styles.stepBadge}>
                    <Text style={styles.stepText}>4/5</Text>
                </View>
            </View>

            <SectionList
                sections={slots.map(s => ({
                    title: s.staffName,
                    staffId: s.staffId,
                    data: [s.slots]
                }))}
                keyExtractor={(item, index) => index.toString()}
                stickySectionHeadersEnabled={true}
                showsVerticalScrollIndicator={false}
                renderSectionHeader={({ section: { title } }) => (
                    <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Barbero: {title}</Text>
                    </View>
                )}
                renderItem={({ item, section }) => (
                    <View style={styles.slotGrid}>
                        {item.map((slot: any, idx: number) => (
                            <SlotButton
                                key={idx}
                                label={slot.label}
                                onSelect={() => handleSelect(slot, section.staffId, section.title)}
                            />
                        ))}
                    </View>
                )}
                contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
            />
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
    loadingText: {
        marginTop: 15,
        fontWeight: '600',
    },
    list: {
        paddingBottom: 40,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        zIndex: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    slotGrid: {
        paddingHorizontal: 16,
        paddingVertical: 15,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 8,
    },
    emptyContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        gap: 15,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    retryBtn: {
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 16,
        marginTop: 10,
    },
    retryText: {
        fontSize: 16,
        fontWeight: '800',
    }
});
