import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { AppLogo } from '../components/ui/AppLogo';

interface Props {
    onFinish: () => void;
}

export default function SplashAnimatedScreen({ onFinish }: Props) {
    // ── Animated values ────────────────────────────────────────────────────────
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.6)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleTranslateY = useRef(new Animated.Value(20)).current;
    const adminTaglineOpacity = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Enforce preventing auto hide (sanity check)
        SplashScreen.preventAutoHideAsync().catch(() => {});

        // Sequential animation logic
        Animated.parallel([
            // a) Logo makes fadeIn + scaleIn
            Animated.spring(logoScale, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),

            // b) "TurnoSync" slides and fades in after 200ms
            Animated.parallel([
                Animated.timing(titleTranslateY, {
                    toValue: 0,
                    duration: 500,
                    delay: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(titleOpacity, {
                    toValue: 1,
                    duration: 500,
                    delay: 200,
                    useNativeDriver: true,
                }),
            ]),

            // c) "ADMIN" and Tagline fadeIn after 400ms
            Animated.timing(adminTaglineOpacity, {
                toValue: 1,
                duration: 400,
                delay: 400,
                useNativeDriver: true,
            }),

            // d) Progress bar begins filling after 600ms
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 1400,
                delay: 600,
                useNativeDriver: false, // width doesn't support native driver
            }),
        ]).start();

        // Security timeout and onFinish
        const timer = setTimeout(async () => {
            try {
                await SplashScreen.hideAsync();
            } catch (e) {}
            onFinish();
        }, 2600); // 2600ms total logic time

        return () => clearTimeout(timer);
    }, [onFinish]);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 180],
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            
            {/* Background */}
            <LinearGradient
                colors={['#FFFFFF', '#F5F5F0']}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.content}>
                {/* 1. LOGO HERO */}
                <Animated.View
                    style={[
                        styles.logoHeroContainer,
                        {
                            opacity: logoOpacity,
                            transform: [{ scale: logoScale }],
                        },
                    ]}
                >
                    <View style={styles.logoHalo}>
                        <AppLogo 
                            size={130} 
                            iconSize={58} 
                            style={styles.logoInner}
                        />
                    </View>
                </Animated.View>

                {/* 2. NOMBRE DE LA APP */}
                <Animated.View
                    style={[
                        styles.titleContainer,
                        {
                            opacity: titleOpacity,
                            transform: [{ translateY: titleTranslateY }],
                        },
                    ]}
                >
                    <Text style={styles.appName}>TurnoSync</Text>
                    <Animated.Text style={[styles.adminLabel, { opacity: adminTaglineOpacity }]}>
                        ADMIN
                    </Animated.Text>
                </Animated.View>

                {/* 3. TAGLINE */}
                <Animated.Text style={[styles.tagline, { opacity: adminTaglineOpacity }]}>
                    Gestión profesional de turnos
                </Animated.Text>
            </View>

            {/* 4. BARRA DE PROGRESO */}
            <View style={styles.progressFooter}>
                <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 40,
    },
    logoHeroContainer: {
        marginBottom: 36,
    },
    logoHalo: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(233,69,96,0.06)',
        borderWidth: 1.5,
        borderColor: 'rgba(233,69,96,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#E94560',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.25,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    logoInner: {
        borderColor: '#E94560',
        backgroundColor: 'rgba(233,69,96,0.06)',
    },
    titleContainer: {
        alignItems: 'center',
    },
    appName: {
        fontSize: 38,
        fontWeight: '800',
        color: '#1A1A1A',
        letterSpacing: 1,
    },
    adminLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#E94560',
        letterSpacing: 6,
        textTransform: 'uppercase',
        marginTop: 4,
    },
    tagline: {
        fontSize: 14,
        color: '#5A5A5A',
        fontStyle: 'italic',
        marginTop: 12,
    },
    progressFooter: {
        position: 'absolute',
        bottom: 80,
        alignSelf: 'center',
    },
    progressTrack: {
        width: 180,
        height: 3,
        backgroundColor: '#EDEDEA',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#E94560',
    },
});

