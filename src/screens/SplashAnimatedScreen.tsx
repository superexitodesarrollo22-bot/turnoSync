import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
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

const { width } = Dimensions.get('window');

// Colores del diseño Luxury
const COLORS = {
    background: '#0D0D1A',
    gold: '#C9A84C',
    white: '#FFFFFF',
    textSecondary: '#A0A0B0',
};

export default function SplashAnimatedScreen({ onFinish }: { onFinish: () => void }) {
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
        <View style={styles.container}>
            {/* Texto superior: Redefining Excellence */}
            <View style={styles.topHeader}>
                <Text style={styles.redefiningText}>REDEFINING EXCELLENCE</Text>
                <View style={styles.loaderContainer}>
                    <Animated.View style={[styles.loaderBar, progressStyle]} />
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
                        <Animated.View style={[styles.decorativeLine, lineStyle]} />
                        <Animated.View entering={FadeInDown.delay(400).duration(800)}>
                            <Text style={styles.vantageText}>VANTAGE</Text>
                        </Animated.View>
                        <Animated.View style={[styles.decorativeLine, lineStyle]} />
                    </View>

                    <Animated.View entering={FadeIn.delay(600).duration(800)}>
                        <Text style={styles.barberStudioText}>BARBER STUDIO</Text>
                    </Animated.View>
                </View>
            </View>

            {/* Footer con textos en las esquinas */}
            <Animated.View
                entering={FadeIn.delay(1000).duration(800)}
                style={styles.footer}
            >
                <Text style={styles.footerText}>EST. 2024</Text>
                <Text style={styles.footerText}>PREMIUM GROOMING</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topHeader: {
        position: 'absolute',
        top: '25%',
        alignItems: 'center',
    },
    redefiningText: {
        color: COLORS.white,
        fontSize: 10,
        letterSpacing: 4,
        fontWeight: '300',
        marginBottom: 8,
    },
    loaderContainer: {
        width: 120,
        height: 1,
        backgroundColor: 'rgba(201, 168, 76, 0.2)',
    },
    loaderBar: {
        height: '100%',
        backgroundColor: COLORS.gold,
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
    logoCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(201, 168, 76, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.gold,
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
        color: COLORS.white,
        fontSize: 48,
        fontWeight: 'bold',
        letterSpacing: 8,
        marginHorizontal: 20,
    },
    decorativeLine: {
        width: 40,
        height: 1,
        backgroundColor: COLORS.gold,
    },
    barberStudioText: {
        color: COLORS.gold,
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
        color: COLORS.textSecondary,
        fontSize: 10,
        letterSpacing: 2,
    },
});
