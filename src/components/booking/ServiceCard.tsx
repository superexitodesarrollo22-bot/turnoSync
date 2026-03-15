import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { formatPrice, formatDuration } from '../../utils/bookingHelpers';

interface ServiceCardProps {
    name: string;
    duration: number;
    price: number;
    onSelect: () => void;
    isSelected?: boolean;
}

export const ServiceCard = ({ name, duration, price, onSelect, isSelected }: ServiceCardProps) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            onPress={onSelect}
            activeOpacity={0.75}
            style={[
                styles.card,
                {
                    backgroundColor: colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                }
            ]}
        >
            <View style={styles.left}>
                <Text style={[styles.name, { color: colors.textPrimary }]}>{name}</Text>
                <Text style={[styles.duration, { color: colors.textSecondary }]}>{formatDuration(duration)}</Text>
            </View>
            <View style={styles.right}>
                <Text style={[styles.price, { color: colors.accent }]}>{formatPrice(price)}</Text>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 14,
        borderWidth: 1.5,
        paddingHorizontal: 18,
        paddingVertical: 16,
        marginBottom: 10,
    },
    left: {
        flex: 1,
        gap: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
    },
    duration: {
        fontSize: 13,
        fontWeight: '500',
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: '800',
    },
});
