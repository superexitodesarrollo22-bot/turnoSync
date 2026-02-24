import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useBusinessDetail } from '../../hooks/useBusinessDetail';
import { useAvailableSlots } from '../../hooks/useAvailableSlots';
import { SkeletonBox } from '../../components/ui/SkeletonBox';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function BusinessDetailScreen({ route, navigation }: any) {
    const { businessId } = route.params;
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const { business, services, loading } = useBusinessDetail(businessId);
    const [selectedDate, setSelectedDate] = useState('');
    const { slots, loading: slotsLoading } = useAvailableSlots(businessId, selectedDate);
    const [selectedService, setSelectedService] = useState<any>(null);

    const next7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() + i);
        return { label: DAYS[d.getDay()], num: d.getDate(), value: d.toISOString().split('T')[0] };
    });

    if (loading) return (
        <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60 }}>
            <SkeletonBox width="60%" height={28} style={{ marginBottom: 12 }} />
            <SkeletonBox width="100%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonBox width="80%" height={16} style={{ marginBottom: 32 }} />
            {[0, 1, 2].map(i => <SkeletonBox key={i} width="100%" height={70} borderRadius={16} style={{ marginBottom: 12 }} />)}
        </View>
    );

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
                    <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.bizName, { color: colors.textPrimary }]}>{business?.name}</Text>
                <Text style={[styles.bizAddr, { color: colors.textSecondary }]}>{business?.address}</Text>
                {business?.description ? <Text style={[styles.bizDesc, { color: colors.textSecondary }]}>{business?.description}</Text> : null}

                {/* Servicios */}
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Servicios</Text>
                {services.map(s => (
                    <TouchableOpacity key={s.id} onPress={() => setSelectedService(s)}
                        style={[styles.serviceCard, { backgroundColor: colors.surface, borderColor: selectedService?.id === s.id ? colors.accent : colors.cardBorder }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.serviceName, { color: colors.textPrimary }]}>{s.name}</Text>
                            <Text style={[styles.serviceDuration, { color: colors.textSecondary }]}>{s.duration_minutes} min</Text>
                        </View>
                        <Text style={[styles.servicePrice, { color: colors.accent }]}>${(s.price_cents / 100).toFixed(2)}</Text>
                        {selectedService?.id === s.id && <Feather name="check-circle" size={18} color={colors.accent} style={{ marginLeft: 8 }} />}
                    </TouchableOpacity>
                ))}

                {/* Selector de fecha */}
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Elige una fecha</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                    {next7Days.map(d => (
                        <TouchableOpacity key={d.value} onPress={() => setSelectedDate(d.value)}
                            style={[styles.dayBtn, { backgroundColor: selectedDate === d.value ? colors.accent : colors.surface, borderColor: colors.cardBorder }]}>
                            <Text style={[styles.dayLabel, { color: selectedDate === d.value ? '#0D0D1A' : colors.textSecondary }]}>{d.label}</Text>
                            <Text style={[styles.dayNum, { color: selectedDate === d.value ? '#0D0D1A' : colors.textPrimary }]}>{d.num}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Slots */}
                {selectedDate && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Horarios disponibles</Text>
                        {slotsLoading ? <SkeletonBox width="100%" height={50} borderRadius={12} /> : (
                            slots.length === 0
                                ? <Text style={[styles.noSlots, { color: colors.textMuted }]}>No hay turnos disponibles este día</Text>
                                : <View style={styles.slotsGrid}>
                                    {slots.map(slot => (
                                        <TouchableOpacity key={slot}
                                            style={[styles.slotBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.cardBorder }]}
                                            activeOpacity={0.8}
                                            onPress={() => {
                                                if (!selectedService) { alert('Selecciona un servicio primero'); return; }
                                                navigation.navigate('ConfirmBooking', { businessId, business, service: selectedService, slot, date: selectedDate });
                                            }}>
                                            <Text style={[styles.slotText, { color: colors.textPrimary }]}>{slot}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                        )}
                    </>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    bizName: { fontSize: 26, fontWeight: '800', marginBottom: 6 },
    bizAddr: { fontSize: 14, marginBottom: 6 },
    bizDesc: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
    sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 24, marginBottom: 14 },
    serviceCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 10 },
    serviceName: { fontSize: 15, fontWeight: '600' },
    serviceDuration: { fontSize: 13, marginTop: 2 },
    servicePrice: { fontSize: 16, fontWeight: '700' },
    dayBtn: { width: 58, height: 70, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    dayLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
    dayNum: { fontSize: 18, fontWeight: '800' },
    slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    slotBtn: { width: '30%', paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
    slotText: { fontSize: 15, fontWeight: '600' },
    noSlots: { fontSize: 14, textAlign: 'center', paddingVertical: 20 },
});
