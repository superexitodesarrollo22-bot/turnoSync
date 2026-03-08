import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { PremiumCard } from '../ui/PremiumCard';
import AnimatedPressable from '../ui/AnimatedPressable';

interface StaffCardProps {
    name: string;
    photoUrl?: string | null;
    onSelect: () => void;
    isSelected?: boolean;
}

export const StaffCard = ({ name, photoUrl, onSelect, isSelected }: StaffCardProps) => {
    const { colors, isDark } = useTheme();

    return (
        <AnimatedPressable onPress={onSelect} style={{ marginBottom: 12 }}>
            <PremiumCard
                elevated={isSelected}
                style={[
                    styles.card,
                    {
                        borderColor: isSelected ? colors.accent : colors.border,
                        padding: 12
                    }
                ]}
            >
                <View style={styles.content}>
                    <View style={styles.left}>
                        {photoUrl ? (
                            <Image source={{ uri: photoUrl }} style={[styles.avatar, { borderColor: isSelected ? colors.accent : colors.border }]} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.accentDim }]}>
                                <Text style={[styles.initial, { color: colors.accent }]}>
                                    {name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <Text style={[styles.name, { color: colors.textPrimary }]}>{name}</Text>
                    </View>
                    {isSelected && (
                        <View style={[styles.checkCircle, { backgroundColor: colors.accent }]}>
                            <Feather name="check" size={14} color="#FFF" />
                        </View>
                    )}
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
        padding: 12,
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
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initial: {
        fontSize: 20,
        fontWeight: '800',
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
