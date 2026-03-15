import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../config/supabase';
import { DatePicker } from '../../components/booking/DatePicker';
import { formatFullDate } from '../../utils/bookingHelpers';
import { GradientButton } from '../../components/ui/GradientButton';
import { PremiumCard } from '../../components/ui/PremiumCard';

export default function BookingSelectDateScreen({ navigation, route }: any) {
    const { businessId, businessName, service, staff } = route.params;
    const { colors, isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const insets = useSafeAreaInsets();
    const [selectedDate, setSelectedDate] = useState('');
    const [config, setConfig] = useState<any>({ max_advance_days: 15 });
    const [blackoutDates, setBlackoutDates] = useState<string[]>([]);
    const [schedules, setSchedules] = useState<number[]>([]);

    useEffect(() => {
        const fetchConfig = async () => {
            setLoading(true);
            try {
                // 1. Configuración del negocio
                const { data: settings } = await supabase
                    .from('business_settings')
                    .select('max_advance_days')
                    .eq('business_id', businessId)
                    .single();
                if (settings) setConfig(settings);

                // 2. Días laborales
                const { data: schedData } = await supabase
                    .from('schedules')
                    .select('weekday')
                    .eq('business_id', businessId);
                if (schedData) setSchedules(schedData.map(s => s.weekday));

                // 3. Blackout dates
                const today = new Date().toISOString().split('T')[0];
                const { data: blackout } = await supabase
                    .from('blackout_dates')
                    .select('date')
                    .eq('business_id', businessId)
                    .gte('date', today);
                if (blackout) setBlackoutDates(blackout.map(b => b.date));

            } catch (e) {
                console.error('[BookingSelectDate] Error:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, [businessId]);

    const handleContinue = () => {
        if (!selectedDate) return;
        navigation.navigate('BookingSelectSlot', {
            businessId,
            businessName,
            service,
            staff,
            date: selectedDate
        });
    };

    const minDate = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setDate(new Date().getDate() + (config.max_advance_days || 15));
    const maxDateStr = maxDate.toISOString().split('T')[0];

    return (
        <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Selecciona una fecha</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{staff.name}</Text>
                </View>
                <View style={styles.stepBadge}>
                    <Text style={styles.stepText}>3/5</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.infoBox}>
                    <Feather name="info" size={16} color={colors.accent} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        Las reservas están abiertas para los próximos {config.max_advance_days} días.
                    </Text>
                </View>

                {loading ? (
                    <View style={styles.loader}>
                        <ActivityIndicator color={colors.accent} size="large" />
                    </View>
                ) : (
                    <DatePicker
                        minDate={minDate}
                        maxDate={maxDateStr}
                        onDateSelect={(day) => setSelectedDate(day.dateString)}
                        selectedDate={selectedDate}
                        disabledDates={blackoutDates}
                        workingDays={schedules}
                    />
                )}

                {selectedDate ? (
                    <PremiumCard style={[styles.selectionPreview, { alignItems: 'center' }]}>
                        <Text style={[styles.previewLabel, { color: colors.textMuted }]}>FECHA SELECCIONADA</Text>
                        <Text style={[styles.previewValue, { color: colors.textPrimary }]}>{formatFullDate(selectedDate)}</Text>
                    </PremiumCard>
                ) : null}
            </ScrollView>

            <View style={[styles.footer, {
                backgroundColor: colors.surface,
                paddingBottom: insets.bottom + 12,
            }]}>
                <GradientButton
                    label="Ver horarios disponibles"
                    onPress={handleContinue}
                    disabled={!selectedDate}
                />
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
        paddingBottom: 140,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
        backgroundColor: 'rgba(201, 168, 76, 0.05)',
        padding: 12,
        borderRadius: 12,
    },
    infoText: {
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
    },
    loader: {
        height: 350,
        justifyContent: 'center',
    },
    selectionPreview: {
        marginTop: 25,
    },
    previewLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    previewValue: {
        fontSize: 16,
        fontWeight: '800',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    continueBtn: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueText: {
        fontSize: 16,
        fontWeight: '800',
    }
});
