import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../services/supabase';
import { useToast } from '../../hooks/useToast';

export default function ConfirmBookingScreen({ route, navigation }: any) {
    const { businessId, business, service, slot, date } = route.params;
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No autenticado');
            const { data: userData } = await supabase.from('users').select('id').eq('supabase_auth_uid', user.id).single();
            if (!userData) throw new Error('Usuario no encontrado');

            const startAt = new Date(`${date}T${slot}:00`);
            const endAt = new Date(startAt.getTime() + service.duration_minutes * 60000);

            const { error } = await supabase.from('appointments').insert({
                business_id: businessId,
                client_user_id: userData.id,
                service_id: service.id,
                start_at: startAt.toISOString(),
                end_at: endAt.toISOString(),
                status: 'pending',
                price_cents: service.price_cents,
            });

            if (error) throw error;
            navigation.reset({ index: 0, routes: [{ name: 'MainTabs', params: { screen: 'MyBookings' } }] });
        } catch (e: any) {
            showToast({ type: 'error', message: e.message ?? 'No se pudo reservar. Intenta de nuevo.' });
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 8 }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
                <Feather name="arrow-left" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={{ paddingHorizontal: 20 }}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Confirmar turno</Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {[
                        { icon: 'scissors', label: 'Barbería', value: business?.name },
                        { icon: 'tag', label: 'Servicio', value: service?.name },
                        { icon: 'calendar', label: 'Fecha', value: new Date(date).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' }) },
                        { icon: 'clock', label: 'Hora', value: slot },
                        { icon: 'dollar-sign', label: 'Precio', value: `$${(service?.price_cents / 100).toFixed(2)}` },
                    ].map((row, i) => (
                        <View key={i} style={[styles.row, i < 4 && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
                            <Feather name={row.icon as any} size={16} color={colors.accent} />
                            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{row.label}</Text>
                            <Text style={[styles.rowValue, { color: colors.textPrimary }]}>{row.value}</Text>
                        </View>
                    ))}
                </View>
                <TouchableOpacity style={[styles.btn, { backgroundColor: colors.accent }]} onPress={handleConfirm} disabled={loading} activeOpacity={0.85}>
                    {loading ? <ActivityIndicator color="#0D0D1A" /> : <Text style={styles.btnText}>Confirmar reserva</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btnSecondary, { borderColor: colors.border }]} onPress={() => navigation.goBack()}>
                    <Text style={[styles.btnSecondaryText, { color: colors.textPrimary }]}>Volver</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    title: { fontSize: 26, fontWeight: '800', marginBottom: 24 },
    card: { borderRadius: 20, borderWidth: 1, marginBottom: 28, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
    rowLabel: { fontSize: 14, width: 70 },
    rowValue: { flex: 1, fontSize: 15, fontWeight: '600', textAlign: 'right' },
    btn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 12 },
    btnText: { fontSize: 16, fontWeight: '700', color: '#0D0D1A' },
    btnSecondary: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1 },
    btnSecondaryText: { fontSize: 16, fontWeight: '600' },
});
