import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    FadeIn,
    FadeInDown,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { useNavigation } from '@react-navigation/native';
import { AppLogo } from '../components/ui/AppLogo';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

export default function SplashAnimatedScreen({ onFinish }: { onFinish: () => void }) {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation<any>();

    // Estados animados
    const lineScale = useSharedValue(0);
    const progressWidth = useSharedValue(0);

    useEffect(() => {
        // 1. Iniciar animación de líneas decorativas (expansión desde el centro)
        lineScale.value = withDelay(700, withTiming(1, { duration: 800 }));

        // 2. Animación de barra de carga (progress bar)
        progressWidth.value = withDelay(800, withTiming(1, { duration: 1500 }));

        // 3. Ocultar splash nativo y finalizar animación
        const timer = setTimeout(async () => {
            await SplashScreen.hideAsync();
            onFinish(); // Notificar a App.tsx que terminó
        }, 3000);

        return () => clearTimeout(timer);
    }, [onFinish]);

    const lineStyle = useAnimatedStyle(() => ({
        transform: [{ scaleX: lineScale.value }],
    }));

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value * 100}%`,
    }));

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Texto superior: Redefining Excellence */}
            <View style={styles.topHeader}>
                <Text style={[styles.redefiningText, { color: colors.textPrimary }]}>REDEFINING EXCELLENCE</Text>
                <View style={[styles.loaderContainer, { backgroundColor: colors.accentDim }]}>
                    <Animated.View style={[styles.loaderBar, { backgroundColor: colors.accent }, progressStyle]} />
                </View>
            </View>

            {/* Centro: Logo + Texto Principal */}
            <View style={styles.centerContent}>
                <Animated.View
                    entering={FadeIn.duration(800)}
                    style={styles.logoContainer}
                >
                    <AppLogo size={70} />
                </Animated.View>

                <View style={styles.brandContainer}>
                    {/* Líneas decorativas laterales */}
                    <View style={styles.titleRow}>
                        <Animated.View style={[styles.decorativeLine, { backgroundColor: colors.accent }, lineStyle]} />
                        <Animated.View entering={FadeInDown.delay(400).duration(800)}>
                            <Text style={[styles.vantageText, { color: colors.textPrimary }]}>VANTAGE</Text>
                        </Animated.View>
                        <Animated.View style={[styles.decorativeLine, { backgroundColor: colors.accent }, lineStyle]} />
                    </View>

                    <Animated.View entering={FadeIn.delay(600).duration(800)}>
                        <Text style={[styles.barberStudioText, { color: colors.accent }]}>BARBER STUDIO</Text>
                    </Animated.View>
                </View>
            </View>

            {/* Footer con textos en las esquinas */}
            <Animated.View
                entering={FadeIn.delay(1000).duration(800)}
                style={styles.footer}
            >
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>EST. 2024</Text>
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>PREMIUM GROOMING</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topHeader: {
        position: 'absolute',
        top: '25%',
        alignItems: 'center',
    },
    redefiningText: {
        fontSize: 10,
        letterSpacing: 4,
        fontWeight: '300',
        marginBottom: 8,
    },
    loaderContainer: {
        width: 120,
        height: 1,
    },
    loaderBar: {
        height: '100%',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        width: 180,
        height: 180,
        marginBottom: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandContainer: {
        alignItems: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    vantageText: {
        fontSize: 48,
        fontWeight: 'bold',
        letterSpacing: 8,
        marginHorizontal: 20,
    },
    decorativeLine: {
        width: 40,
        height: 1,
    },
    barberStudioText: {
        fontSize: 14,
        letterSpacing: 10,
        fontWeight: '600',
        marginTop: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        width: '80%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerText: {
        fontSize: 10,
        letterSpacing: 2,
    },
});
