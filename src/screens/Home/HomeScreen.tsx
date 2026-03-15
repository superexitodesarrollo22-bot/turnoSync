import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useBusinesses } from '../../hooks/useBusinesses';
import { HomeScreenSkeleton, BusinessCardSkeleton } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import AnimatedPressable from '../../components/ui/AnimatedPressable';
import FadeInView from '../../components/ui/FadeInView';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { GradientButton } from '../../components/ui/GradientButton';

export default function HomeScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const {
        businesses,
        loading: bizLoading,
        error: bizError,
        refetch
    } = useBusinesses(searchQuery);
    const { user, loading: userLoading } = useCurrentUser();

    useFocusEffect(
        useCallback(() => {
            // Recargar barberías cuando la pantalla recibe foco
            // Esto cubre el caso de cambio de usuario
            refetch();
        }, [])
    );

    if (userLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <HomeScreenSkeleton />
            </View>
        );
    }

    const renderBusinessCard = ({ item, index }: { item: any; index: number }) => (
        <FadeInView delay={index * 60} style={{ marginBottom: 10 }}>
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('BusinessDetail', { businessId: item.id })}
                style={[
                    styles.bCard,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            >
                <View style={[styles.bCardIcon, { backgroundColor: colors.accentDim }]}>
                    {item.logo_url ? (
                        <Image
                            source={{ uri: item.logo_url }}
                            style={styles.bCardIconImg}
                        />
                    ) : (
                        <Feather name="scissors" size={18} color={colors.accent} />
                    )}
                </View>
                <View style={styles.bCardInfo}>
                    <Text
                        style={[styles.bCardName, { color: colors.textPrimary }]}
                        numberOfLines={1}
                    >
                        {item.name}
                    </Text>
                    {item.address ? (
                        <View style={styles.bCardRow}>
                            <Feather
                                name="map-pin"
                                size={11}
                                color={colors.textMuted}
                                style={{ marginRight: 4 }}
                            />
                            <Text
                                style={[styles.bCardAddr, { color: colors.textMuted }]}
                                numberOfLines={1}
                            >
                                {item.address}
                            </Text>
                        </View>
                    ) : null}
                </View>
                <View style={[styles.bCardBtn, { backgroundColor: colors.accent }]}>
                    <Text style={styles.bCardBtnText}>Reservar</Text>
                </View>
            </TouchableOpacity>
        </FadeInView>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <View style={styles.headerLeft}>
                    {user?.avatar_url ? (
                        <Image
                            source={{ uri: user.avatar_url }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={[styles.avatarFallback, { backgroundColor: colors.accent }]}>
                            <Text style={[styles.avatarInitial, { color: isDark ? '#0D0D1A' : '#FFFFFF' }]}>
                                {(user?.full_name ?? 'U').charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                    <View style={styles.headerTextCol}>
                        <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
                            Bienvenido
                        </Text>
                        <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
                            {user?.full_name?.split(' ')[0] ?? 'Usuario'} 👋
                        </Text>
                    </View>
                </View>
                <TouchableOpacity style={[styles.bellBtn, { backgroundColor: isDark ? '#1A1A2E' : '#F0EDE8' }]}>
                    <Feather name="bell" size={20} color={colors.accent} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchBar, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <Feather name="search" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                    style={[styles.searchInput, { color: colors.textPrimary }]}
                    placeholder="Buscar barbería..."
                    placeholderTextColor={colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Feather name="x" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Section Title */}
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Barberías disponibles</Text>
                <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>({businesses.length})</Text>
            </View>

            {/* Error Message */}
            {bizError && (
                <Text style={{ color: colors.error, textAlign: 'center', padding: 20 }}>
                    Error cargando barberías: {bizError}
                </Text>
            )}

            {/* List */}
            {bizLoading && businesses.length === 0 ? (
                <View style={[styles.listContent, { paddingTop: 16 }]}>
                    {[1, 2, 3].map(i => (
                        <View key={i} style={[styles.bCard, {
                            backgroundColor: colors.surfaceElevated || colors.surface,
                            borderColor: colors.border,
                            marginBottom: 10,
                            opacity: 0.5,
                        }]}>
                            <View style={{ width: 42, height: 42, borderRadius: 21,
                                backgroundColor: colors.divider }} />
                            <View style={{ flex: 1, gap: 6 }}>
                                <View style={{ height: 14, width: '60%', borderRadius: 7,
                                    backgroundColor: colors.divider }} />
                                <View style={{ height: 11, width: '40%', borderRadius: 6,
                                    backgroundColor: colors.divider }} />
                            </View>
                            <View style={{ width: 72, height: 34, borderRadius: 10,
                                backgroundColor: colors.divider }} />
                        </View>
                    ))}
                </View>
            ) : businesses.length === 0 && !bizLoading ? (
                <EmptyState
                    icon="search-outline"
                    title="Sin resultados"
                    subtitle="No encontramos barberos en tu zona. Intenta con otra búsqueda."
                />
            ) : (
                <FlatList
                    data={businesses}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 40 }]}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderBusinessCard}
                    onEndReachedThreshold={0.3}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerTextCol: {
        flex: 1,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
    },
    avatarFallback: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    welcomeText: {
        fontSize: 13,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    bellBtn: {
        borderRadius: 20,
        padding: 10,
    },
    searchBar: {
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        height: 52,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionCount: {
        fontSize: 14,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptySubtitle: {
        fontSize: 14,
        marginTop: 8,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 12,
    },
    cardIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    cardIconImg: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    cardInfo: {
        flex: 1,
        gap: 3,
    },
    businessName: {
        fontSize: 15,
        fontWeight: '700',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIcon: {
        marginRight: 4,
    },
    infoText: {
        fontSize: 12,
        flexShrink: 1,
    },
    reserveBtn: {
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 9,
        flexShrink: 0,
    },
    reserveBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0D0D1A',
    },
    bCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 12,
    },
    bCardIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    bCardIconImg: {
        width: 42,
        height: 42,
        borderRadius: 21,
    },
    bCardInfo: {
        flex: 1,
        gap: 3,
    },
    bCardName: {
        fontSize: 15,
        fontWeight: '700',
    },
    bCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bCardAddr: {
        fontSize: 12,
        flexShrink: 1,
    },
    bCardBtn: {
        borderRadius: 10,
        paddingHorizontal: 13,
        paddingVertical: 8,
        flexShrink: 0,
    },
    bCardBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0D0D1A',
    },
});
