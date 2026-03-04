import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useMyAppointments } from '../../hooks/useMyAppointments';
import { AppointmentCard } from '../../components/booking/AppointmentCard';

type TabType = 'upcoming' | 'past' | 'cancelled';

export default function MyAppointmentsScreen({ navigation }: any) {
    const { colors, isDark } = useTheme();
    const [currentTab, setCurrentTab] = useState<TabType>('upcoming');
    const { appointments, loading, refetch } = useMyAppointments(currentTab);

    const renderHeader = () => (
        <View style={styles.tabContainer}>
            <TouchableOpacity
                style={[styles.tab, currentTab === 'upcoming' && { borderBottomColor: colors.accent }]}
                onPress={() => setCurrentTab('upcoming')}
            >
                <Text style={[styles.tabText, { color: currentTab === 'upcoming' ? colors.accent : colors.textMuted }]}>Próximos</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, currentTab === 'past' && { borderBottomColor: colors.accent }]}
                onPress={() => setCurrentTab('past')}
            >
                <Text style={[styles.tabText, { color: currentTab === 'past' ? colors.accent : colors.textMuted }]}>Pasados</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, currentTab === 'cancelled' && { borderBottomColor: colors.accent }]}
                onPress={() => setCurrentTab('cancelled')}
            >
                <Text style={[styles.tabText, { color: currentTab === 'cancelled' ? colors.accent : colors.textMuted }]}>Cancelados</Text>
            </TouchableOpacity>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.accentDim }]}>
                <Feather name="calendar" size={40} color={colors.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                {currentTab === 'upcoming' ? 'No tienes turnos pendientes' :
                    currentTab === 'past' ? 'No hay historial' : 'No tienes turnos cancelados'}
            </Text>
            {currentTab === 'upcoming' && (
                <TouchableOpacity
                    style={[styles.reserveBtn, { backgroundColor: colors.accent }]}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={[styles.reserveBtnText, { color: isDark ? '#0D0D1A' : '#FFFFFF' }]}>Reservar un turno</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.screenHeader}>
                <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Mis Turnos</Text>
            </View>

            {renderHeader()}

            <FlatList
                data={appointments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <AppointmentCard
                        appointment={item}
                        onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
                    />
                )}
                contentContainerStyle={styles.list}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.accent} />
                }
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    screenHeader: {
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 10,
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: '800',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        marginBottom: 15,
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
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
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    reserveBtn: {
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 10,
    },
    reserveBtnText: {
        fontSize: 15,
        fontWeight: '700',
    }
});
