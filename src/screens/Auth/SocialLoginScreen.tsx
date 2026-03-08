import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useToast } from '../../hooks/useToast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppLogo } from '../../components/ui/AppLogo';

const { width } = Dimensions.get('window');

export default function SocialLoginScreen() {
    const navigation = useNavigation<any>();
    const { signInWithGoogle } = useAuth();
    const { colors, isDark } = useTheme();
    const { showToast } = useToast();
    const insets = useSafeAreaInsets();

    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            const { error } = await signInWithGoogle();
            if (error && error !== 'Cancelado por el usuario') {
                showToast({ type: 'error', message: error });
            }
        } catch (error: any) {
            showToast({ type: 'error', message: error.message || 'Error de conexión' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* Logo Section */}
                <View style={styles.logoWrapper}>
                    <AppLogo size={100} />
                </View>

                {/* Welcome Text in Spanish */}
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                    Bienvenido a tu{"\n"}experiencia premium{"\n"}de barbería
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Eleva tu estilo con maestros barberos
                </Text>

                {/* Primary Button: Google Only */}
                <TouchableOpacity
                    style={[
                        styles.googleBtn,
                        {
                            backgroundColor: colors.accent,
                            elevation: isDark ? 0 : 3,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: isDark ? 0 : 0.1,
                            shadowRadius: 4,
                        }
                    ]}
                    onPress={handleGoogleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={isDark ? "#0D0D1A" : "#FFFFFF"} />
                    ) : (
                        <View style={styles.googleBtnContent}>
                            <FontAwesome5 name="google" size={18} color={isDark ? "#0D0D1A" : "#FFFFFF"} style={styles.googleIcon} />
                            <Text style={[styles.googleBtnText, { color: isDark ? "#0D0D1A" : "#FFFFFF" }]}>Continuar con Google</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Footer Legal in Spanish */}
                <View style={styles.footer}>
                    <Text style={[styles.legalText, { color: colors.textMuted }]}>
                        AL CONTINUAR, ACEPTAS NUESTROS TÉRMINOS DE SERVICIO Y POLÍTICA DE PRIVACIDAD.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingTop: 60,
        paddingBottom: 40,
    },
    logoWrapper: {
        marginBottom: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 38,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 60,
    },
    googleBtn: {
        width: '100%',
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    googleBtnContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    googleIcon: {
        marginRight: 10,
    },
    googleBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 60,
        alignItems: 'center',
    },
    legalText: {
        fontSize: 10,
        textAlign: 'center',
        opacity: 0.8,
        paddingHorizontal: 30,
        lineHeight: 16,
        textTransform: 'uppercase',
    },
});
