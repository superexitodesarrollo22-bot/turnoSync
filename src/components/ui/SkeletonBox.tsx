import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

export const SkeletonBox = ({ width, height, borderRadius = 8, style }: any) => {
    const { colors } = useTheme();
    const opacity = useSharedValue(0.3);
    useEffect(() => {
        opacity.value = withRepeat(withTiming(0.9, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true);
    }, []);
    const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
    return <Animated.View style={[{ width, height, borderRadius, backgroundColor: colors.surfaceElevated }, animStyle, style]} />;
};
