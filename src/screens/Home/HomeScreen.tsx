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
    Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useBusinesses } from '../../hooks/useBusinesses';
import { HomeScreenSkeleton } from '../../components/ui/SkeletonLoader';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const { businesses, loading: bizLoading } = useBusinesses(searchQuery);
    const { user, loading: userLoading } = useCurrentUser();

    if (userLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
                <HomeScreenSkeleton />
            </View>
        );
    }

    const firstName = user?.full_name?.split(' ')[0] ?? 'Usuario';

    const renderBusinessCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('BusinessDetail', { businessId: item.id, business: item })}
        >
            {/* Top Part */}
            <View style={styles.cardHeader}>
                <Feather name="scissors" size={44} color="#C9A84C" style={{ opacity: 0.25 }} />
                <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
                    <Text style={styles.statusText}>Abierto</Text>
                </View>
            </View>

            {/* Bottom Part */}
            <View style={styles.cardBody}>
                <Text style={styles.businessName}>{item.name}</Text>

                <View style={styles.infoRow}>
                    <Feather name="map-pin" size={12} color="#C9A84C" style={styles.infoIcon} />
                    <Text style={styles.infoText} numberOfLines={1}>{item.address}</Text>
                </View>

                {item.phone && (
                    <View style={styles.infoRow}>
                        <Feather name="phone" size={12} color="#C9A84C" style={styles.infoIcon} />
                        <Text style={styles.infoText}>{item.phone}</Text>
                    </View>
                )}

                {item.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}

                <TouchableOpacity
                    style={styles.reserveBtn}
                    onPress={() => navigation.navigate('BusinessDetail', { businessId: item.id, business: item })}
                >
                    <Text style={styles.reserveBtnText}>Reservar ahora</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: '#0D0D1A' }]}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <View style={styles.headerLeft}>
                    {user?.avatar_url ? (
                        <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitials}>
                                {user?.full_name?.charAt(0) || 'U'}
                            </Text>
                        </View>
                    )}
                    <View>
                        <Text style={styles.welcomeText}>Hola,</Text>
                        <Text style={styles.userName}>{firstName}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
                    <Feather name="bell" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Feather name="search" size={18} color="#C9A84C" style={{ marginRight: 10 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar barberías..."
                    placeholderTextColor="#6B6B80"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Feather name="x" size={16} color="#6B6B80" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Section Title */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Barberías disponibles</Text>
                <Text style={styles.sectionCount}>({businesses.length})</Text>
            </View>

            {/* List */}
            {bizLoading && businesses.length === 0 ? (
                <View style={styles.centered}>
                    <ActivityIndicator color="#C9A84C" size="large" />
                </View>
            ) : businesses.length === 0 ? (
                <View style={[styles.centered, { paddingTop: 60 }]}>
                    <Feather name="search" size={52} color="#C9A84C" style={{ opacity: 0.4, marginBottom: 16 }} />
                    <Text style={styles.emptyTitle}>Sin resultados</Text>
                    <Text style={styles.emptySubtitle}>Intenta con otro nombre</Text>
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
        gap: 12,
    },
    avatarImg: {
        width: 46,
        height: 46,
        borderRadius: 23,
        borderWidth: 2,
        borderColor: '#C9A84C',
    },
    avatarPlaceholder: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#C9A84C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        color: '#0D0D1A',
        fontWeight: 'bold',
        fontSize: 18,
    },
    welcomeText: {
        color: '#A0A0B0',
        fontSize: 13,
    },
    userName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    bellBtn: {
        backgroundColor: '#1A1A2E',
        borderRadius: 20,
        padding: 10,
    },
    searchBar: {
        marginHorizontal: 20,
        marginBottom: 16,
        backgroundColor: '#1A1A2E',
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        height: 52,
        borderWidth: 1,
        borderColor: '#2A2A3E',
    },
    searchInput: {
        flex: 1,
        color: 'white',
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
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionCount: {
        color: '#A0A0B0',
        fontSize: 14,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptySubtitle: {
        color: '#A0A0B0',
        fontSize: 14,
        marginTop: 8,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#1A1A2E',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
    },
    cardHeader: {
        height: 130,
        backgroundColor: '#252538',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#4CAF50',
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
        color: 'white',
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
        color: '#A0A0B0',
        fontSize: 13,
        flexShrink: 1,
    },
    description: {
        color: '#6B6B80',
        fontSize: 12,
        marginBottom: 12,
    },
    reserveBtn: {
        backgroundColor: '#C9A84C',
        borderRadius: 10,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reserveBtnText: {
        color: 'black',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
