import React from 'react';
import { TouchableOpacity, Image, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export const UserAvatar = ({ uri, name, size = 38, onPress }: any) => {
    const { colors } = useTheme();
    const initials = name?.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            {uri
                ? <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: colors.accent }} />
                : <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceElevated, borderWidth: 2, borderColor: colors.accent, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: colors.accent, fontSize: size * 0.35, fontWeight: '700' }}>{initials}</Text>
                </View>
            }
        </TouchableOpacity>
    );
};
