import React, { useState } from 'react';
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
import { HomeScreenSkeleton } from '../../components/ui/SkeletonLoader';

export default function HomeScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const { businesses, loading: bizLoading, error: bizError } = useBusinesses(searchQuery);
    const { user, loading: userLoading } = useCurrentUser();

    if (userLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <HomeScreenSkeleton />
            </View>
        );
    }

    const renderBusinessCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowColor: isDark ? 'transparent' : '#000',
                    elevation: isDark ? 0 : 3,
                }
            ]}
            onPress={() => navigation.navigate('BusinessProfile', { businessId: item.id })}
        >
            {/* Área de imagen/logo */}
            <View style={[styles.cardImageArea, { backgroundColor: colors.surfaceElevated }]}>
                {item.logo_url
                    ? <Image source={{ uri: item.logo_url }} style={styles.cardImage} resizeMode="cover" />
                    : <Feather name="scissors" size={32} color={colors.accent} />
                }
                <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
                    <Text style={styles.statusText}>Abierto</Text>
                </View>
            </View>

            {/* Cuerpo */}
            <View style={styles.cardBody}>
                <Text style={[styles.businessName, { color: colors.textPrimary }]}>
                    {item.name}
                </Text>

                {item.description ? (
                    <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                        {item.description}
                    </Text>
                ) : null}

                {item.address ? (
                    <View style={styles.infoRow}>
                        <Feather name="map-pin" size={13} color={colors.accent} style={styles.infoIcon} />
                        <Text style={[styles.infoText, { color: colors.textSecondary }]} numberOfLines={1}>
                            {item.address}
                        </Text>
                    </View>
                ) : null}

                {item.phone ? (
                    <View style={styles.infoRow}>
                        <Feather name="phone" size={13} color={colors.accent} style={styles.infoIcon} />
                        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                            {item.phone}
                        </Text>
                    </View>
                ) : null}

                {/* Botón reservar */}
                <TouchableOpacity
                    style={[styles.reserveBtn, { backgroundColor: colors.accent }]}
                    onPress={() => navigation.navigate('BusinessProfile', { businessId: item.id })}
                >
                    <Text style={[styles.reserveBtnText, { color: isDark ? '#0D0D1A' : '#FFFFFF' }]}>
                        Reservar turno
                    </Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
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
                <View style={styles.centered}>
                    <ActivityIndicator color={colors.accent} size="large" />
                </View>
            ) : businesses.length === 0 && !bizLoading ? (
                <View style={[styles.centered, { paddingTop: 60 }]}>
                    <Feather name="search" size={52} color={colors.accent} style={{ opacity: 0.4, marginBottom: 16 }} />
                    <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin resultados</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Intenta con otro nombre</Text>
                </View>
            ) : (
                <FlatList
                    data={businesses}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderBusinessCard}
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
        paddingBottom: 100,
    },
    card: {
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
    },
    cardImageArea: {
        height: 130,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    statusBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    statusText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
    },
    cardBody: {
        padding: 16,
    },
    businessName: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoIcon: {
        marginRight: 6,
    },
    infoText: {
        fontSize: 13,
        flexShrink: 1,
    },
    description: {
        fontSize: 12,
        marginBottom: 12,
    },
    reserveBtn: {
        borderRadius: 10,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    reserveBtnText: {
        fontSize: 15,
        fontWeight: 'bold',
    },
});
