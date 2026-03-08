import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../services/supabase';
import { StaffCard } from '../../components/booking/StaffCard';
import { ProfileScreenSkeleton } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import { PremiumCard } from '../../components/ui/PremiumCard';
import AnimatedPressable from '../../components/ui/AnimatedPressable';

export default function BookingSelectStaffScreen({ navigation, route }: any) {
    const { businessId, businessName, service } = route.params;
    const { colors, isDark } = useTheme();
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStaff = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('staff')
                    .select('id, name, photo_url')
                    .eq('business_id', businessId)
                    .eq('active', true);

                if (error) throw error;
                setStaff(data || []);
            } catch (e) {
                console.error('[BookingSelectStaff] Error:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, [businessId]);

    const handleSelect = (staffMember: any) => {
        navigation.navigate('BookingSelectDate', {
            businessId,
            businessName,
            service,
            staff: staffMember ? { id: staffMember.id, name: staffMember.name } : { id: null, name: 'Cualquier barbero' }
        });
    };

    if (loading) return <ProfileScreenSkeleton />;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Elige tu barbero</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{service.name}</Text>
                </View>
                <View style={styles.stepBadge}>
                    <Text style={styles.stepText}>2/5</Text>
                </View>
            </View>

            <AnimatedPressable
                style={{ marginHorizontal: 20, marginVertical: 10 }}
                onPress={() => handleSelect(null)}
            >
                <PremiumCard style={[styles.anyStaffBtn, { padding: 16 }]}>
                    <View style={[styles.anyStaffIcon, { backgroundColor: colors.accentDim }]}>
                        <Feather name="users" size={20} color={colors.accent} />
                    </View>
                    <View style={styles.anyStaffTextCol}>
                        <Text style={[styles.anyStaffTitle, { color: colors.textPrimary }]}>Cualquier barbero disponible</Text>
                        <Text style={[styles.anyStaffSubtitle, { color: colors.textMuted }]}>Asignación automática rápida</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={colors.textMuted} />
                </PremiumCard>
            </AnimatedPressable>

            <View style={styles.listHeader}>
                <Text style={[styles.listHeaderTitle, { color: colors.textSecondary }]}>NUESTRO EQUIPO</Text>
            </View>

            <FlatList
                data={staff}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <StaffCard
                        name={item.name}
                        photoUrl={item.photo_url}
                        onSelect={() => handleSelect(item)}
                    />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <EmptyState
                        icon="person-outline"
                        title="Sin personal"
                        subtitle="No hay barberos disponibles para esta barbería."
                    />
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
    anyStaffBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    anyStaffIcon: {
        width: 46,
        height: 46,
        borderRadius: 23,
        justifyContent: 'center',
        alignItems: 'center',
    },
    anyStaffTextCol: {
        flex: 1,
    },
    anyStaffTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    anyStaffSubtitle: {
        fontSize: 12,
        fontWeight: '500',
    },
    listHeader: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    listHeaderTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
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
