import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    Easing
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const SkeletonItem = ({ style }: { style: any }) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(0.7, {
                duration: 800,
                easing: Easing.inOut(Easing.ease)
            }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return <Animated.View style={[styles.skeletonBase, style, animatedStyle]} />;
};

export const HomeScreenSkeleton = () => (
    <View style={styles.container}>
        {/* Header Skeleton */}
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <SkeletonItem style={styles.avatar46} />
                <View style={styles.headerTextCol}>
                    <SkeletonItem style={styles.lineSmall} />
                    <SkeletonItem style={styles.lineMedium} />
                </View>
            </View>
            <SkeletonItem style={styles.bellCircle} />
        </View>

        {/* Search Bar Skeleton */}
        <SkeletonItem style={styles.searchBar} />

        {/* Section Title Skeleton */}
        <SkeletonItem style={styles.sectionTitle} />

        {/* Cards Skeleton */}
        {[1, 2, 3].map((i) => (
            <SkeletonItem key={i} style={styles.cardLarge} />
        ))}
    </View>
);

export const BookingsScreenSkeleton = () => (
    <View style={styles.container}>
        {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.bookingCard}>
                <SkeletonItem style={styles.rect48} />
                <View style={styles.bookingDetails}>
                    <SkeletonItem style={styles.lineFull} />
                    <SkeletonItem style={styles.line70} />
                    <SkeletonItem style={styles.line40} />
                </View>
            </View>
        ))}
    </View>
);

export const ProfileScreenSkeleton = () => (
    <View style={styles.containerCentered}>
        <SkeletonItem style={styles.bigAvatar80} />
        <SkeletonItem style={styles.line150} />
        <SkeletonItem style={styles.line100} />
        <View style={styles.menuList}>
            {[1, 2, 3, 4].map((i) => (
                <SkeletonItem key={i} style={styles.menuItem56} />
            ))}
        </View>
    </View>
);

// Provided for compatibility
export const ServicesScreenSkeleton = () => (
    <View style={styles.container}>
        <SkeletonItem style={styles.sectionTitle} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {[1, 2, 3, 4].map((i) => (
                <SkeletonItem key={i} style={{ width: '48%', height: 120, borderRadius: 12, marginBottom: 15 }} />
            ))}
        </View>
    </View>
);

const styles = StyleSheet.create({
    skeletonBase: {
        backgroundColor: '#1A1A2E',
    },
    container: { flex: 1, padding: 20 },
    containerCentered: { flex: 1, padding: 20, alignItems: 'center' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    avatar46: { width: 46, height: 46, borderRadius: 23, marginRight: 12 },
    headerTextCol: { gap: 6 },
    lineSmall: { width: 40, height: 12, borderRadius: 4 },
    lineMedium: { width: 100, height: 18, borderRadius: 4 },
    bellCircle: { width: 40, height: 40, borderRadius: 20 },
    searchBar: { width: '100%', height: 52, borderRadius: 14, marginBottom: 25 },
    sectionTitle: { width: 150, height: 20, borderRadius: 4, marginBottom: 20 },
    cardLarge: { width: '100%', height: 280, borderRadius: 16, marginBottom: 16 },
    bookingCard: {
        flexDirection: 'row',
        height: 110,
        width: '100%',
        backgroundColor: '#1A1A2E',
        borderRadius: 14,
        padding: 15,
        marginBottom: 12,
        alignItems: 'center'
    },
    rect48: { width: 48, height: 48, borderRadius: 8 },
    bookingDetails: { flex: 1, marginLeft: 15, gap: 8 },
    lineFull: { width: '100%', height: 14, borderRadius: 4 },
    line70: { width: '70%', height: 12, borderRadius: 4 },
    line40: { width: '40%', height: 12, borderRadius: 4 },
    bigAvatar80: { width: 80, height: 80, borderRadius: 40, marginBottom: 16, marginTop: 40 },
    line150: { width: 150, height: 20, borderRadius: 4, marginBottom: 8 },
    line100: { width: 100, height: 14, borderRadius: 4, marginBottom: 30 },
    menuList: { width: '100%', gap: 8 },
    menuItem56: { width: '100%', height: 56, borderRadius: 12 },
});
