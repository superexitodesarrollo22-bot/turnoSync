import React from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';

const { width } = Dimensions.get('window');

const SkeletonItem = ({ style }: { style: any }) => {
    const opacity = React.useRef(new Animated.Value(0.3)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return <Animated.View style={[styles.skeletonBase, style, { opacity }]} />;
};

export const HomeScreenSkeleton = () => (
    <View style={styles.container}>
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
        <SkeletonItem style={styles.searchBar} />
        <SkeletonItem style={styles.sectionTitle} />
        {[1, 2, 3].map((i) => (
            <SkeletonItem key={i} style={styles.cardLarge} />
        ))}
    </View>
);

export const BookingsScreenSkeleton = ({ paddingTop = 0 }: { paddingTop?: number }) => (
    <View style={[styles.container, { paddingTop: paddingTop + 16 }]}>
        <SkeletonItem style={{ width: 160, height: 28, borderRadius: 6, marginBottom: 8 }} />
        <SkeletonItem style={{ width: 90, height: 14, borderRadius: 4, marginBottom: 24 }} />

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <SkeletonItem style={{ flex: 1, height: 40, borderRadius: 14 }} />
            <SkeletonItem style={{ flex: 1, height: 40, borderRadius: 14 }} />
        </View>

        {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonCard}>
                <SkeletonItem style={{ width: 4, height: '100%', borderRadius: 4, marginRight: 12 }} />
                <SkeletonItem style={{ width: 44, height: 44, borderRadius: 22, marginRight: 14 }} />
                <View style={{ flex: 1, gap: 8 }}>
                    <SkeletonItem style={{ width: '70%', height: 16, borderRadius: 4 }} />
                    <SkeletonItem style={{ width: '50%', height: 13, borderRadius: 4 }} />
                    <SkeletonItem style={{ width: '40%', height: 13, borderRadius: 4 }} />
                </View>
                <SkeletonItem style={{ width: 48, height: 16, borderRadius: 4, marginLeft: 8 }} />
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
    skeletonBase: { backgroundColor: '#1A1A2E' },
    container: { flex: 1, padding: 20 },
    containerCentered: { flex: 1, padding: 20, alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 20 },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    avatar46: { width: 46, height: 46, borderRadius: 23, marginRight: 12 },
    headerTextCol: { gap: 6 },
    lineSmall: { width: 40, height: 12, borderRadius: 4 },
    lineMedium: { width: 100, height: 18, borderRadius: 4 },
    bellCircle: { width: 40, height: 40, borderRadius: 20 },
    searchBar: { width: '100%', height: 52, borderRadius: 14, marginBottom: 25 },
    sectionTitle: { width: 150, height: 20, borderRadius: 4, marginBottom: 20 },
    cardLarge: { width: '100%', height: 280, borderRadius: 16, marginBottom: 16 },
    skeletonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 90,
        width: '100%',
        backgroundColor: '#1A1A2E',
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        overflow: 'hidden',
    },
    bigAvatar80: { width: 80, height: 80, borderRadius: 40, marginBottom: 16, marginTop: 40 },
    line150: { width: 150, height: 20, borderRadius: 4, marginBottom: 8 },
    line100: { width: 100, height: 14, borderRadius: 4, marginBottom: 30 },
    menuList: { width: '100%', gap: 8 },
    menuItem56: { width: '100%', height: 56, borderRadius: 12 },
});
