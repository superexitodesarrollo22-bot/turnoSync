import { useColorScheme } from 'react-native';

export const Colors = {
    dark: {
        background: '#0D0D1A', surface: '#1A1A2E', surfaceElevated: '#16213E',
        accent: '#C9A84C', accentLight: '#E8C97A', textPrimary: '#FFFFFF',
        textSecondary: '#A0A0B0', textMuted: '#5A5A70', divider: '#2A2A3E',
        success: '#2ECC71', warning: '#F39C12', error: '#E74C3C',
        cardBorder: '#2A2A45', inputBackground: '#1E1E35', navBar: '#12121F',
    },
    light: {
        background: '#F4F4F8', surface: '#FFFFFF', surfaceElevated: '#EFEFF5',
        accent: '#B8923A', accentLight: '#C9A84C', textPrimary: '#0D0D1A',
        textSecondary: '#6B6B80', textMuted: '#A0A0B0', divider: '#E0E0E8',
        success: '#27AE60', warning: '#E67E22', error: '#C0392B',
        cardBorder: '#E0E0EC', inputBackground: '#EDEDF5', navBar: '#FFFFFF',
    },
};

export const useTheme = () => {
    const scheme = useColorScheme();
    const colors = scheme === 'dark' ? Colors.dark : Colors.light;
    return { colors, isDark: scheme === 'dark' };
};
