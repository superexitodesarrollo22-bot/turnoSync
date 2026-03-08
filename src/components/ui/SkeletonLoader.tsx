import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

function useShimmer() {
    const { isDark } = useTheme();
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    const baseColor = isDark ? '#2A2A3E' : '#E0E0E8';
    const highlightColor = isDark ? '#383855' : '#F0F0F5';

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: false,
                }),
            ])
        ).start();
    }, [shimmerAnim, isDark]);

    const backgroundColor = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [baseColor, highlightColor],
    });

    return backgroundColor;
}

interface SkeletonBoxProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: any;
    flex?: number;
}

const SkeletonBox = ({ width, height, borderRadius = 4, style, flex }: SkeletonBoxProps) => {
    const backgroundColor = useShimmer();

    return (
        <Animated.View
            style={[
                { width, height, borderRadius, backgroundColor, flex },
                style,
            ]}
        />
    );
};

export const BusinessCardSkeleton = () => {
    const { colors } = useTheme();
    return (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <SkeletonBox width="100%" height={130} borderRadius={16} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
            <View style={{ padding: 16 }}>
                <SkeletonBox width="80%" height={20} style={{ marginBottom: 8 }} />
                <SkeletonBox width="50%" height={14} />
            </View>
        </View>
    );
};

export const BookingCardSkeleton = () => {
    const { colors } = useTheme();
    return (
        <View style={[styles.bookingCard, { backgroundColor: colors.surface }]}>
            <View style={styles.row}>
                <SkeletonBox width={44} height={44} borderRadius={22} style={{ marginRight: 12 }} />
                <View style={{ flex: 1, gap: 6 }}>
                    <SkeletonBox width="60%" height={16} />
                    <SkeletonBox width="40%" height={14} />
                    <SkeletonBox width="50%" height={12} />
                </View>
                <SkeletonBox width={70} height={22} borderRadius={11} style={{ marginLeft: 8 }} />
            </View>
        </View>
    );
};

export const ServiceCardSkeleton = () => {
    const { colors } = useTheme();
    return (
        <View style={[styles.serviceCard, { backgroundColor: colors.surface }]}>
            <SkeletonBox width={48} height={48} borderRadius={24} style={{ marginBottom: 12 }} />
            <SkeletonBox width="80%" height={16} style={{ marginBottom: 6 }} />
            <SkeletonBox width="50%" height={14} />
        </View>
    );
};

export const HomeScreenSkeleton = () => {
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <SkeletonBox width={44} height={44} borderRadius={22} style={{ marginRight: 12 }} />
                    <View style={{ gap: 6 }}>
                        <SkeletonBox width={60} height={12} />
                        <SkeletonBox width={100} height={18} />
                    </View>
                </View>
                <SkeletonBox width={40} height={40} borderRadius={20} />
            </View>
            <View style={{ paddingHorizontal: 20 }}>
                <SkeletonBox width="100%" height={52} borderRadius={14} style={{ marginBottom: 16 }} />
                <SkeletonBox width={150} height={20} style={{ marginBottom: 12 }} />
                {[1, 2, 3].map(i => <BusinessCardSkeleton key={i} />)}
            </View>
        </View>
    );
};

export const BookingsScreenSkeleton = ({ paddingTop = 0 }: { paddingTop?: number }) => {
    return (
        <View style={[styles.container, { paddingTop: paddingTop + 16, paddingHorizontal: 16 }]}>
            <SkeletonBox width={160} height={28} style={{ marginBottom: 8 }} />
            <SkeletonBox width={90} height={14} style={{ marginBottom: 24 }} />

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                <SkeletonBox flex={1} height={40} borderRadius={14} />
                <SkeletonBox flex={1} height={40} borderRadius={14} />
            </View>

            {[1, 2, 3, 4].map(i => <BookingCardSkeleton key={i} />)}
        </View>
    );
};

export const ProfileScreenSkeleton = () => {
    const { colors } = useTheme();
    return (
        <View style={styles.containerCentered}>
            <SkeletonBox width={80} height={80} borderRadius={40} style={{ marginBottom: 16, marginTop: 40 }} />
            <SkeletonBox width={150} height={20} style={{ marginBottom: 8 }} />
            <SkeletonBox width={100} height={14} style={{ marginBottom: 30 }} />
            <View style={styles.menuList}>
                {[1, 2, 3, 4].map((i) => (
                    <SkeletonBox key={i} width="100%" height={56} borderRadius={12} style={{ marginBottom: 8 }} />
                ))}
            </View>
        </View>
    );
};

export const ServicesScreenSkeleton = () => (
    <View style={styles.container}>
        <SkeletonBox width={150} height={20} style={{ marginBottom: 20 }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {[1, 2, 3, 4].map((i) => (
                <ServiceCardSkeleton key={i} />
            ))}
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    containerCentered: { flex: 1, padding: 20, alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 20 },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    card: {
        width: '100%',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    bookingCard: {
        width: '100%',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    serviceCard: {
        width: (width / 2) - 24,
        height: 100,
        borderRadius: 12,
        marginBottom: 15,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuList: { width: '100%', gap: 8 },
});
