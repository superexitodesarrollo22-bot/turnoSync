import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface AppLogoProps {
    size?: number;
    iconSize?: number;
    style?: ViewStyle;
}

export const AppLogo = ({ size = 72, iconSize, style }: AppLogoProps) => {
    const { colors } = useTheme();
    const borderRadius = size / 2;
    const finalIconSize = iconSize || 32;

    return (
        <View style={[
            styles.logoCircle,
            {
                width: size,
                height: size,
                borderRadius: borderRadius,
                borderColor: colors.accent,
                backgroundColor: colors.accentDim
            },
            style
        ]}>
            <Feather name="scissors" size={finalIconSize} color={colors.accent} />
        </View>
    );
};

const styles = StyleSheet.create({
    logoCircle: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
});
