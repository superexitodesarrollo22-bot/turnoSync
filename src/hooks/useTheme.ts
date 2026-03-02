import { useColorScheme } from 'react-native';

export const Colors = {
    dark: {
        background: '#0D0D1A',
        surface: '#1A1A2E',
        surfaceElevated: '#252538',
        border: '#2A2A3E',
        accent: '#C9A84C',
        accentDim: 'rgba(201,168,76,0.15)',
        textPrimary: '#FFFFFF',
        textSecondary: '#A0A0B0',
        textMuted: '#6B6B80',
        error: '#FF6B6B',
        success: '#4CAF50',
        navBar: '#0D0D1A',
        divider: '#2A2A3E',
        cardShadow: 'transparent',
        inputBackground: '#1A1A2E',
        statusBar: 'dark' as const,
    },
    light: {
        background: '#F5F5F0',
        surface: '#FFFFFF',
        surfaceElevated: '#FAFAFA',
        border: '#E8E8E0',
        accent: '#B8961E',
        accentDim: 'rgba(184,150,30,0.12)',
        textPrimary: '#1A1A1A',
        textSecondary: '#5A5A5A',
        textMuted: '#9A9A9A',
        error: '#D93025',
        success: '#2E7D32',
        navBar: '#FFFFFF',
        divider: '#EEEEEE',
        cardShadow: 'rgba(0,0,0,0.08)',
        inputBackground: '#F8F8F4',
        statusBar: 'light' as const,
    },
};

export const useTheme = () => {
    const isDark = useColorScheme() === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;

    return { colors, isDark };
};
