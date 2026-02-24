import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useBusinesses } from '../../hooks/useBusinesses';
import { UserAvatar } from '../../components/ui/UserAvatar';
import { UserMenuSheet } from '../../components/modals/UserMenuSheet';
import { HomeScreenSkeleton } from '../../components/skeletons/HomeScreenSkeleton';

export default function HomeScreen({ navigation }: any) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { user } = useCurrentUser();
    const [query, setQuery] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const { businesses, loading } = useBusinesses(query);

    const firstName = user?.full_name?.split(' ')[0] ?? 'Bienvenido';

    if (loading && !query) return <HomeScreenSkeleton />;

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greeting, { color: colors.textSecondary }]}>Hola,</Text>
                    <Text style={[styles.name, { color: colors.textPrimary }]}>{firstName} 👋</Text>
                </View>
                <UserAvatar uri={user?.avatar_url} name={user?.full_name ?? ''} size={42} onPress={() => setShowMenu(true)} />
            </View>

            {/* Search */}
            <View style={[styles.searchWrap, { backgroundColor: colors.inputBackground }]}>
                <Feather name="search" size={18} color={colors.textMuted} />
                <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Buscar barbería..."
                    placeholderTextColor={colors.textMuted}
                    style={[styles.searchInput, { color: colors.textPrimary }]}
                />
                {query.length > 0 && <TouchableOpacity onPress={() => setQuery('')}><Feather name="x" size={16} color={colors.textMuted} /></TouchableOpacity>}
            </View>

            {/* List */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                {query ? `Resultados para "${query}"` : 'Barberías disponibles'}
            </Text>

            <FlatList
                data={businesses}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                            {query ? 'Sin resultados' : 'No hay barberías disponibles aún'}
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('BusinessDetail', { businessId: item.id })}
                    >
                        <View style={[styles.cardImg, { backgroundColor: colors.surfaceElevated }]}>
                            {item.logo_url
                                ? <Image source={{ uri: item.logo_url }} style={styles.cardImgFull} />
                                : <Text style={{ fontSize: 32 }}>✂️</Text>
                            }
                        </View>
                        <View style={styles.cardBody}>
                            <Text style={[styles.cardName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                            <Text style={[styles.cardAddr, { color: colors.textSecondary }]} numberOfLines={2}>{item.address}</Text>
                            <View style={styles.cardFooter}>
                                <Feather name="map-pin" size={12} color={colors.accent} />
                                <Text style={[styles.cardDist, { color: colors.accent }]}>Ver turnos</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />

            <UserMenuSheet visible={showMenu} onClose={() => setShowMenu(false)} user={user} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    greeting: { fontSize: 14 },
    name: { fontSize: 22, fontWeight: '700' },
    searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24 },
    searchInput: { flex: 1, fontSize: 15 },
    sectionTitle: { fontSize: 17, fontWeight: '700', marginHorizontal: 20, marginBottom: 14 },
    card: { flexDirection: 'row', borderRadius: 20, borderWidth: 1, marginBottom: 14, overflow: 'hidden' },
    cardImg: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center' },
    cardImgFull: { width: 90, height: 90 },
    cardBody: { flex: 1, padding: 14, justifyContent: 'center' },
    cardName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    cardAddr: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cardDist: { fontSize: 12, fontWeight: '600' },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 15 },
});
