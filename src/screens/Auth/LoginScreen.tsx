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
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppLogo } from '../../components/ui/AppLogo';

const { width } = Dimensions.get('window');

const COLORS = {
    background: '#0D0D1A',
    surface: '#1A1A2E',
    border: '#2A2A3E',
    gold: '#C9A84C',
    white: '#FFFFFF',
    textSecondary: '#A0A0B0',
};

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const { signInWithGoogle } = useAuth();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            const { error } = await signInWithGoogle();
            if (error && error !== 'Cancelado por el usuario') {
                Alert.alert('OAuth Error', error);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Check your internet connection');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider: 'apple' | 'facebook') => {
        Alert.alert('Próximamente', `El inicio de sesión con ${provider} estará disponible pronto.`);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="light" />

            {/* Header / Back */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* Logo Section */}
                <View style={styles.logoWrapper}>
                    <AppLogo size={70} />
                </View>

                {/* Welcome Text */}
                <Text style={styles.title}>
                    Welcome to your{"\n"}premium grooming{"\n"}experience
                </Text>
                <Text style={styles.subtitle}>
                    Elevate your style with master barbers
                </Text>

                {/* Primary Button: Google */}
                <TouchableOpacity
                    style={styles.googleBtn}
                    onPress={handleGoogleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#0D0D1A" />
                    ) : (
                        <View style={styles.googleBtnContent}>
                            <FontAwesome5 name="google" size={18} color="#0D0D1A" style={styles.googleIcon} />
                            <Text style={styles.googleBtnText}>Continue with Google</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Separator */}
                <View style={styles.separatorRow}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>OR CONTINUE WITH</Text>
                    <View style={styles.line} />
                </View>

                {/* Secondary Buttons */}
                <View style={styles.socialRow}>
                    <TouchableOpacity
                        style={styles.socialBtn}
                        onPress={() => handleSocialLogin('apple')}
                    >
                        <FontAwesome5 name="apple" size={20} color={COLORS.white} />
                        <Text style={styles.socialBtnText}>Apple</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.socialBtn}
                        onPress={() => handleSocialLogin('facebook')}
                    >
                        <FontAwesome5 name="facebook" size={20} color="#1877F2" />
                        <Text style={styles.socialBtnText}>Facebook</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.signInRow}>
                        <Text style={styles.footerText}>Existing user? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('EmailLogin')}>
                            <Text style={styles.signInText}>Sign in with Email</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.legalText}>
                        By continuing, you agree to TurnoSync's Terms of Service and Privacy Policy.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: 20,
        height: 50,
        justifyContent: 'center',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingTop: 20,
        paddingBottom: 40,
    },
    logoWrapper: {
        marginBottom: 40,
    },
    title: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 38,
        marginBottom: 12,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 50,
    },
    googleBtn: {
        width: '100%',
        height: 56,
        backgroundColor: COLORS.gold,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    googleBtnContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    googleIcon: {
        marginRight: 10,
    },
    googleBtnText: {
        color: '#0D0D1A',
        fontSize: 16,
        fontWeight: 'bold',
    },
    separatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 30,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    orText: {
        color: COLORS.textSecondary,
        fontSize: 11,
        fontWeight: '600',
        marginHorizontal: 15,
        letterSpacing: 1,
    },
    socialRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        gap: 15,
    },
    socialBtn: {
        flex: 1,
        flexDirection: 'row',
        height: 50,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    socialBtnText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    signInRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    signInText: {
        color: COLORS.gold,
        fontSize: 14,
        fontWeight: 'bold',
    },
    legalText: {
        color: COLORS.textSecondary,
        fontSize: 10,
        textAlign: 'center',
        opacity: 0.6,
        paddingHorizontal: 20,
        lineHeight: 16,
    },
});
