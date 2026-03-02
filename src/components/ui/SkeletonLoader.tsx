import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    Easing
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const SkeletonItem = ({ style }: { style: any }) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(0.8, {
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
        <View style={styles.header}>
            <SkeletonItem style={styles.avatar} />
            <View style={styles.headerText}>
                <SkeletonItem style={styles.name} />
                <SkeletonItem style={styles.subtitle} />
            </View>
        </View>
        <SkeletonItem style={styles.featured} />
        <SkeletonItem style={styles.btn} />
        <SkeletonItem style={styles.btn} />
        <View style={styles.row}>
            <SkeletonItem style={styles.cardHalf} />
            <SkeletonItem style={styles.cardHalf} />
        </View>
    </View>
);

export const BookingsScreenSkeleton = () => (
    <View style={styles.container}>
        {[1, 2, 3].map((i) => (
            <View key={i} style={styles.bookingRow}>
                <SkeletonItem style={styles.circle48} />
                <View style={styles.flex1}>
                    <SkeletonItem style={styles.lineFull} />
                    <SkeletonItem style={styles.line70} />
                    <SkeletonItem style={styles.line40} />
                </View>
            </View>
        ))}
    </View>
);

export const ServicesScreenSkeleton = () => (
    <View style={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.gridItem}>
                <SkeletonItem style={styles.circle40} />
                <SkeletonItem style={styles.line70} />
                <SkeletonItem style={styles.line40} />
            </View>
        ))}
    </View>
);

export const ProfileScreenSkeleton = () => (
    <View style={styles.containerCentered}>
        <SkeletonItem style={styles.bigAvatar} />
        <SkeletonItem style={styles.line150} />
        <SkeletonItem style={styles.line100} />
        <View style={styles.menuList}>
            {[1, 2, 3, 4].map((i) => (
                <SkeletonItem key={i} style={styles.menuItem} />
            ))}
        </View>
    </View>
);

const styles = StyleSheet.create({
    skeletonBase: {
        backgroundColor: '#1A1A2E',
        borderRadius: 8,
    },
    container: { flex: 1, padding: 20 },
    containerCentered: { flex: 1, padding: 20, alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, marginTop: 40 },
    avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 15 },
    headerText: { gap: 8 },
    name: { width: 120, height: 16 },
    subtitle: { width: 80, height: 12 },
    featured: { width: '100%', height: 200, borderRadius: 16, marginBottom: 20 },
    btn: { width: '100%', height: 56, borderRadius: 12, marginBottom: 15 },
    row: { flexDirection: 'row', gap: 15, justifyContent: 'space-between' },
    cardHalf: { flex: 1, height: 80, borderRadius: 12 },
    bookingRow: { flexDirection: 'row', gap: 15, marginBottom: 20, alignItems: 'center' },
    circle48: { width: 48, height: 48, borderRadius: 24 },
    flex1: { flex: 1, gap: 8 },
    lineFull: { width: '100%', height: 14 },
    line70: { width: '70%', height: 12 },
    line40: { width: '40%', height: 12 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, gap: 15 },
    gridItem: { width: (width - 50) / 2, height: 120, borderRadius: 12, padding: 15, alignItems: 'center', gap: 10, backgroundColor: '#1A1A2E' },
    circle40: { width: 40, height: 40, borderRadius: 20 },
    bigAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 20, marginTop: 40 },
    line150: { width: 150, height: 20, marginBottom: 10 },
    line100: { width: 100, height: 14, marginBottom: 40 },
    menuList: { width: '100%', gap: 12 },
    menuItem: { width: '100%', height: 52, borderRadius: 12 },
});
