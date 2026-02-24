import React from 'react';
import { View } from 'react-native';
import { SkeletonBox } from '../ui/SkeletonBox';
import { useTheme } from '../../hooks/useTheme';

export const BookingListSkeleton = () => {
    const { colors } = useTheme();
    return (
        <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60 }}>
            <SkeletonBox width="50%" height={26} style={{ marginBottom: 20 }} />
            {[0, 1, 2].map(i => <SkeletonBox key={i} width="100%" height={110} borderRadius={20} style={{ marginBottom: 14 }} />)}
        </View>
    );
};
