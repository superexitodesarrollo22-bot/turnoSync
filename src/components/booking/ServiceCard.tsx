import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { formatPrice, formatDuration } from '../../utils/bookingHelpers';
import { PremiumCard } from '../ui/PremiumCard';
import AnimatedPressable from '../ui/AnimatedPressable';

interface ServiceCardProps {
    name: string;
    duration: number;
    price: number;
    onSelect: () => void;
    isSelected?: boolean;
}

export const ServiceCard = ({ name, duration, price, onSelect, isSelected }: ServiceCardProps) => {
    const { colors, isDark } = useTheme();

    return (
        <AnimatedPressable onPress={onSelect} style={{ marginBottom: 12 }}>
            <PremiumCard
                elevated={isSelected}
                style={[
                    styles.card,
                    {
                        borderColor: isSelected ? colors.accent : colors.border,
                        padding: 16
                    }
                ]}
            >
                <View style={styles.content}>
                    <View>
                        <Text style={[styles.name, { color: colors.textPrimary }]}>{name}</Text>
                        <Text style={[styles.duration, { color: colors.textSecondary }]}>{formatDuration(duration)}</Text>
                    </View>
                    <View style={styles.rightSide}>
                        <Text style={[styles.price, { color: colors.accent }]}>{formatPrice(price)}</Text>
                        <Feather name="chevron-right" size={20} color={colors.textMuted} />
                    </View>
                </View>
            </PremiumCard>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 1.5,
        marginBottom: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    duration: {
        fontSize: 13,
        fontWeight: '500',
    },
    rightSide: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    price: {
        fontSize: 16,
        fontWeight: '800',
    },
});
