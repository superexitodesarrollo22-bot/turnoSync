import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface AppLogoProps {
    size?: number;
    iconSize?: number;
    style?: ViewStyle;
}

export const AppLogo = ({ size = 70, iconSize, style }: AppLogoProps) => {
    const gold = '#C9A84C';
    const borderRadius = size / 2;
    const finalIconSize = iconSize || size * 0.45;

    return (
        <View style={[
            styles.logoCircle,
            {
                width: size,
                height: size,
                borderRadius: borderRadius,
                borderColor: gold
            },
            style
        ]}>
            <Feather name="scissors" size={finalIconSize} color={gold} />
        </View>
    );
};

const styles = StyleSheet.create({
    logoCircle: {
        backgroundColor: 'rgba(201, 168, 76, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
    },
});
