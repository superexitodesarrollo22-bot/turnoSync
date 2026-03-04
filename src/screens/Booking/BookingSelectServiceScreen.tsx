import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../services/supabase';
import { ServiceCard } from '../../components/booking/ServiceCard';
import { ServicesScreenSkeleton } from '../../components/ui/SkeletonLoader';

export default function BookingSelectServiceScreen({ navigation, route }: any) {
    const { businessId, businessName } = route.params;
    const { colors, isDark } = useTheme();
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('services')
                    .select('id, name, duration_minutes, price_cents')
                    .eq('business_id', businessId)
                    .eq('active', true);

                if (error) throw error;
                setServices(data || []);
            } catch (e) {
                console.error('[BookingSelectService] Error:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [businessId]);

    const handleSelect = (service: any) => {
        navigation.navigate('BookingSelectStaff', {
            businessId,
            businessName,
            service
        });
    };

    if (loading) return <ServicesScreenSkeleton />;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Seleccionar Servicio</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{businessName}</Text>
                </View>
                <View style={styles.stepBadge}>
                    <Text style={styles.stepText}>1/5</Text>
                </View>
            </View>

            <FlatList
                data={services}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ServiceCard
                        name={item.name}
                        duration={item.duration_minutes}
                        price={item.price_cents}
                        onSelect={() => handleSelect(item)}
                    />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={{ color: colors.textMuted }}>No hay servicios disponibles.</Text>
                    </View>
                }
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
        backgroundColor: '#C9A84C',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    stepText: {
        color: '#0D0D1A',
        fontSize: 12,
        fontWeight: '800',
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    empty: {
        alignItems: 'center',
        marginTop: 100,
    }
});
