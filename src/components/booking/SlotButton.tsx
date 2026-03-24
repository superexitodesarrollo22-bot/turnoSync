import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import AnimatedPressable from '../ui/AnimatedPressable';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 64) / 4; // 4 columnas con padding lateral

interface SlotButtonProps {
    label: string;
    onSelect: () => void;
    isSelected?: boolean;
}

export const SlotButton = ({ label, onSelect, isSelected }: SlotButtonProps) => {
    const { colors, isDark } = useTheme();

    return (
        <TouchableOpacity 
            onPress={onSelect} 
            activeOpacity={0.7}
            style={[
                styles.button,
                {
                    backgroundColor: isSelected ? colors.accent : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border
                }
            ]}
        >
            <Text style={[
                styles.label,
                { color: isSelected ? (isDark ? '#0D0D1A' : '#FFFFFF') : colors.textPrimary }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: COLUMN_WIDTH,
        height: 48,
        borderRadius: 12,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
    },
});
