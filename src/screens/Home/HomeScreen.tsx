import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { HomeScreenSkeleton } from '../../components/ui/SkeletonLoader';
import { AppLogo } from '../../components/ui/AppLogo';

const COLORS = {
    background: '#0D0D1A',
    surface: '#1A1A2E',
    border: '#2A2A3E',
    gold: '#C9A84C',
    white: '#FFFFFF',
    textSecondary: '#A0A0B0',
    success: '#4CAF50',
};

export default function HomeScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { user, loading } = useCurrentUser();

    if (loading) return <HomeScreenSkeleton />;

    const firstName = user?.full_name?.split(' ')[0] ?? 'there';

    const handleNotifications = () => {
        Alert.alert('Notificaciones', 'Notificaciones próximamente');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View style={styles.headerLeft}>
                    <View style={styles.avatarCircle}>
                        {user?.avatar_url ? (
                            <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} />
                        ) : (
                            <Text style={styles.avatarText}>
                                {user?.full_name?.charAt(0) || 'U'}
                            </Text>
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <AppLogo size={24} iconSize={12} style={{ marginRight: 8 }} />
                        <Text style={styles.brandName}>BarberPro</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.notificationBtn}
                    onPress={handleNotifications}
                >
                    <Feather name="bell" size={20} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeTitle}>Welcome, {firstName}!</Text>
                    <Text style={styles.welcomeSubtitle}>Ready for your next cut?</Text>
                </View>

                {/* Featured Card */}
                <TouchableOpacity style={styles.featuredCard} activeOpacity={0.9}>
                    <Image
                        source={require('../../../assets/splash.png')}
                        style={styles.featuredImage}
                        resizeMode="cover"
                    />
                    <View style={styles.trendingBadge}>
                        <Text style={styles.trendingText}>TRENDING</Text>
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>Summer Fresh Styles</Text>
                        <Text style={styles.cardDesc}>Check out the latest trends and styles for this season.</Text>
                        <TouchableOpacity>
                            <Text style={styles.cardLink}>Explore Gallery →</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>

                {/* Quick Actions */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
                </View>

                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('BusinessList')}
                >
                    <View style={styles.actionBtnLeft}>
                        <View style={styles.iconBox}>
                            <Feather name="calendar" size={18} color={COLORS.gold} />
                        </View>
                        <Text style={styles.actionBtnText}>Book Now</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('Services')}
                >
                    <View style={styles.actionBtnLeft}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name="content-cut" size={18} color={COLORS.gold} />
                        </View>
                        <Text style={styles.actionBtnText}>View Services</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>NEXT APPOINTMENT</Text>
                        <Text style={styles.statValue}>Tomorrow, 10:30 AM</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>LOYALTY POINTS</Text>
                        <Text style={styles.statValueGold}>450 pts</Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.gold,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        overflow: 'hidden',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        color: '#0D0D1A',
        fontWeight: 'bold',
        fontSize: 14,
    },
    brandName: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '700',
    },
    notificationBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    welcomeSection: {
        marginTop: 20,
        marginBottom: 30,
    },
    welcomeTitle: {
        color: COLORS.white,
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        color: COLORS.gold,
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 30,
    },
    featuredCard: {
        width: '100%',
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 30,
    },
    featuredImage: {
        width: '100%',
        height: 180,
    },
    trendingBadge: {
        position: 'absolute',
        top: 15,
        left: 15,
        backgroundColor: COLORS.success,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    trendingText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardInfo: {
        padding: 15,
    },
    cardTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    cardDesc: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginBottom: 12,
        lineHeight: 18,
    },
    cardLink: {
        color: COLORS.gold,
        fontSize: 14,
        fontWeight: '700',
    },
    sectionHeader: {
        marginBottom: 15,
    },
    sectionLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    actionBtnLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(201, 168, 76, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    actionBtnText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statLabel: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 8,
    },
    statValue: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    statValueGold: {
        color: COLORS.gold,
        fontSize: 15,
        fontWeight: 'bold',
    },
});
