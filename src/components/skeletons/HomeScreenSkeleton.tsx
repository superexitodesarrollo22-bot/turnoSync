import React from 'react';
import { View } from 'react-native';
import { SkeletonBox } from '../ui/SkeletonBox';
import { useTheme } from '../../hooks/useTheme';

export const HomeScreenSkeleton = () => {
    const { colors } = useTheme();
    return (
        <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60 }}>
            <SkeletonBox width="55%" height={26} style={{ marginBottom: 8 }} />
            <SkeletonBox width="38%" height={16} style={{ marginBottom: 24 }} />
            <SkeletonBox width="100%" height={50} borderRadius={16} style={{ marginBottom: 32 }} />
            <SkeletonBox width="40%" height={18} style={{ marginBottom: 14 }} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <SkeletonBox width={160} height={210} borderRadius={20} />
                <SkeletonBox width={160} height={210} borderRadius={20} />
            </View>
        </View>
    );
};
