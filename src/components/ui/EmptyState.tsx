import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface EmptyStateProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
    const { colors } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.container,
                { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] },
            ]}
        >
            <View style={[styles.iconCircle, { backgroundColor: colors.accentDim }]}>
                <Ionicons name={icon} size={36} color={colors.accent} />
            </View>

            <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
            {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}

            {actionLabel && onAction && (
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.accent }]}
                    onPress={onAction}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.buttonText, { color: '#0D0D1A' }]}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    button: {
        marginTop: 24,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 14,
    },
});
