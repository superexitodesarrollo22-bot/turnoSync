import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';

export interface GradientHeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    rightAction?: React.ReactNode;
}

export function GradientHeader({
    title,
    subtitle,
    onBack,
    rightAction,
}: GradientHeaderProps) {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();

    const gradientColors = (isDark
        ? ['#1A1A2E', '#0D0D1A']
        : ['#FFFFFF', '#F4F4F8']) as readonly [string, string, ...string[]];

    return (
        <LinearGradient
            colors={gradientColors}
            style={[styles.container, { paddingTop: insets.top + 12 }]}
        >
            <View style={styles.headerRow}>
                {onBack ? (
                    <TouchableOpacity onPress={onBack} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
                        <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.backBtnPlaceholder} />
                )}

                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>{title}</Text>
                    {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>{subtitle}</Text>}
                </View>

                {rightAction ? (
                    <View style={styles.rightAction}>
                        {rightAction}
                    </View>
                ) : (
                    <View style={styles.backBtnPlaceholder} />
                )}
            </View>
            <View style={[styles.separator, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backBtnPlaceholder: {
        width: 36,
        height: 36,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    rightAction: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    separator: {
        height: 1,
    },
});
