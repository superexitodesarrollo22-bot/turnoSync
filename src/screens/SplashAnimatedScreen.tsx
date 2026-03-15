import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AppLogo } from '../components/ui/AppLogo';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

export default function SplashAnimatedScreen({ onFinish }: { onFinish: () => void }) {
    const { colors } = useTheme();

    const lineScale = useRef(new Animated.Value(0)).current;
    const progressWidth = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const footerOpacity = useRef(new Animated.Value(0)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const featuresOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(logoOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.parallel([
                Animated.timing(titleOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(lineScale, { toValue: 1, duration: 800, useNativeDriver: true }),
            ]),
            Animated.timing(progressWidth, { toValue: 1, duration: 1200, useNativeDriver: false }),
            Animated.parallel([
                Animated.timing(footerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(taglineOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
                Animated.timing(featuresOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
            ]),
        ]).start();

        const timer = setTimeout(async () => {
            await SplashScreen.hideAsync();
            onFinish();
        }, 3800);

        return () => clearTimeout(timer);
    }, [onFinish]);

    const animatedProgressWidth = progressWidth.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.topHeader}>
                <Text style={[styles.redefiningText, { color: colors.textPrimary }]}>
                    MEJORA TU EXPERIENCIA
                </Text>
                <View style={[styles.loaderContainer, { backgroundColor: colors.accentDim }]}>
                    <Animated.View
                        style={[
                            styles.loaderBar,
                            { backgroundColor: colors.accent, width: animatedProgressWidth },
                        ]}
                    />
                </View>
                <Animated.Text
                    style={[
                        styles.featuresText,
                        { color: colors.accent, opacity: featuresOpacity },
                    ]}
                >
                    Reservas · Notificaciones · Satisfacción
                </Animated.Text>
            </View>

            <View style={styles.centerContent}>
                <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
                    <AppLogo size={70} />
                </Animated.View>

                <View style={styles.brandContainer}>
                    <View style={styles.titleRow}>
                        <Animated.View
                            style={[
                                styles.decorativeLine,
                                { backgroundColor: colors.accent, transform: [{ scaleX: lineScale }] },
                            ]}
                        />
                        <Animated.Text
                            style={[
                                styles.vantageText,
                                { color: colors.textPrimary, opacity: titleOpacity },
                            ]}
                        >
                            TurnoSync
                        </Animated.Text>
                        <Animated.View
                            style={[
                                styles.decorativeLine,
                                { backgroundColor: colors.accent, transform: [{ scaleX: lineScale }] },
                            ]}
                        />
                    </View>
                    <Animated.Text
                        style={[
                            styles.barberStudioText,
                            { color: colors.accent, opacity: titleOpacity },
                        ]}
                    >
                        BARBER STUDIO
                    </Animated.Text>
                    <Animated.Text
                        style={[
                            styles.taglineText,
                            { color: colors.textSecondary, opacity: taglineOpacity },
                        ]}
                    >
                        Tu satisfacción, nuestro compromiso
                    </Animated.Text>
                </View>
            </View>

            <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
                <View style={styles.footerLeft}>
                    <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>EST. 2024</Text>
                    <Text style={[styles.footerValue, { color: colors.accent }]}>ADMINISTRACIÓN</Text>
                </View>
                <View style={styles.footerDivider} />
                <View style={styles.footerRight}>
                    <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>GESTIÓN DE</Text>
                    <Text style={[styles.footerValue, { color: colors.accent }]}>TURNOS</Text>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    topHeader: { position: 'absolute', top: '25%', alignItems: 'center' },
    redefiningText: { fontSize: 10, letterSpacing: 4, fontWeight: '300', marginBottom: 8 },
    loaderContainer: { width: 120, height: 1 },
    loaderBar: { height: '100%' },
    centerContent: { alignItems: 'center', justifyContent: 'center' },
    logoContainer: {
        width: 180,
        height: 180,
        marginBottom: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandContainer: { alignItems: 'center' },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    vantageText: { fontSize: 48, fontWeight: 'bold', letterSpacing: 8, marginHorizontal: 20 },
    decorativeLine: { width: 40, height: 1 },
    barberStudioText: { fontSize: 14, letterSpacing: 10, fontWeight: '600', marginTop: 5 },
    footer: {
        position: 'absolute',
        bottom: 50,
        width: '80%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerLeft: { alignItems: 'flex-start' },
    footerRight: { alignItems: 'flex-end' },
    footerDivider: { width: 1, height: 20, backgroundColor: 'rgba(201,168,76,0.3)' },
    footerLabel: { fontSize: 8, letterSpacing: 2, fontWeight: '300' },
    footerValue: { fontSize: 9, letterSpacing: 2, fontWeight: '600', marginTop: 2 },
    taglineText: { fontSize: 11, letterSpacing: 1.5, fontWeight: '300', marginTop: 12, fontStyle: 'italic' },
    featuresText: { fontSize: 9, letterSpacing: 2, fontWeight: '400', marginTop: 6 },
});
