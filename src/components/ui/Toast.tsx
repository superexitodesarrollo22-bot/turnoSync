import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ToastConfig } from '../../contexts/ToastContext';
import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

const ICONS = {
    success: 'checkmark-circle',
    error: 'alert-circle',
    warning: 'warning',
    info: 'information-circle',
} as const;

export default function ToastUI({ config, visible, onHide }: { config: ToastConfig, visible: boolean, onHide: () => void }) {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, translateY, opacity]);

    const borderColors = {
        success: '#2ECC71',
        error: '#E74C3C',
        warning: '#F39C12',
        info: colors.accent,
    };

    const borderColor = borderColors[config.type] || borderColors.info;
    const iconName = ICONS[config.type] || ICONS.info;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    top: insets.top + 10,
                    backgroundColor: colors.surface,
                    borderLeftColor: borderColor,
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            <Ionicons name={iconName} size={24} color={borderColor} style={styles.icon} />
            <Text style={[styles.message, { color: colors.textPrimary }]}>{config.message}</Text>
            <TouchableOpacity onPress={onHide} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignSelf: 'center',
        width: width - 32,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        borderLeftWidth: 4,
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    icon: {
        marginRight: 10,
    },
    message: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    closeBtn: {
        padding: 4,
    },
});
