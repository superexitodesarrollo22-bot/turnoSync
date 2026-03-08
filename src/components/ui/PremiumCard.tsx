import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedPressable from './AnimatedPressable';
import { useTheme } from '../../hooks/useTheme';

export interface PremiumCardProps {
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
    gradient?: boolean;
    gradientColors?: readonly [string, string, ...string[]];
    onPress?: () => void;
    elevated?: boolean;
}

export function PremiumCard({
    children,
    style,
    gradient = false,
    gradientColors,
    onPress,
    elevated = false,
}: PremiumCardProps) {
    const { colors, isDark } = useTheme();

    const defaultGradientColors = (isDark
        ? ['#1A1A2E', '#16213E']
        : ['#FFFFFF', '#F8F8F4']) as readonly [string, string, ...string[]];

    const actualGradientColors = gradientColors || defaultGradientColors;

    const cardStyle = [
        styles.card,
        { backgroundColor: colors.surface },
        elevated && styles.elevated,
        !isDark && elevated && styles.elevatedLight,
        style,
    ];

    const content = gradient ? (
        <LinearGradient colors={actualGradientColors as readonly [string, string, ...string[]]} style={cardStyle}>
            {children}
        </LinearGradient>
    ) : (
        <View style={cardStyle}>
            {children}
        </View>
    );

    if (onPress) {
        return (
            <AnimatedPressable onPress={onPress}>
                {content}
            </AnimatedPressable>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(201,168,76,0.12)', // Borde dorado sutil
    },
    elevated: {
        elevation: 0,
    },
    elevatedLight: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
    }
});
