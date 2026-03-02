import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../hooks/useTheme';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

const COLORS = {
    background: '#0D0D1A',
    surface: '#1A1A2E',
    border: '#2A2A3E',
    gold: '#C9A84C',
    white: '#FFFFFF',
    error: '#FF6B6B',
    textSecondary: '#A0A0B0',
};

export default function EmailLoginScreen() {
    const navigation = useNavigation<any>();
    const { signInWithGoogle } = useAuth();
    const { colors } = useTheme();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Errores de validación
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateEmail = (text: string) => {
        const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
        return reg.test(text);
    };

    const handleLogin = async () => {
        let isValid = true;

        if (!email) {
            setEmailError('Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email');
            isValid = false;
        } else {
            setEmailError('');
        }

        if (!password) {
            setPasswordError('Password is required');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            isValid = false;
        } else {
            setPasswordError('');
        }

        if (!isValid) return;

        try {
            setIsLoading(true);
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                Alert.alert('Login Error', error.message);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Check your credentials');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email || !validateEmail(email)) {
            Alert.alert('Input Required', 'Please enter a valid email address first.');
            return;
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) {
                Alert.alert('Error', error.message);
            } else {
                Alert.alert('Success', 'Check your email for the reset link.');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to send reset link.');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Sign In</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Text style={styles.welcomeTitle}>Credentials</Text>
                    <Text style={styles.welcomeSubtitle}>Enter your details to access your profile</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
                            <TextInput
                                style={styles.input}
                                placeholder="name@example.com"
                                placeholderTextColor={COLORS.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.label}>Password</Text>
                            <TouchableOpacity onPress={handleForgotPassword}>
                                <Text style={styles.forgotText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.inputWrapper, passwordError ? styles.inputError : null]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Min. 6 characters"
                                placeholderTextColor={COLORS.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Feather
                                    name={showPassword ? "eye" : "eye-off"}
                                    size={20}
                                    color={COLORS.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                    </View>

                    <TouchableOpacity
                        style={styles.loginBtn}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#0D0D1A" />
                        ) : (
                            <Text style={styles.loginBtnText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <Text style={styles.noAccountText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerText}>Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
    backBtn: { padding: 5 },
    headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '600' },
    form: { marginTop: 40, paddingHorizontal: 24 },
    welcomeTitle: { color: COLORS.white, fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    welcomeSubtitle: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 30 },
    inputGroup: { marginBottom: 20 },
    label: { color: COLORS.white, fontSize: 14, fontWeight: '500', marginBottom: 8 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    forgotText: { color: COLORS.gold, fontSize: 13, fontWeight: '500' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, height: 56 },
    input: { flex: 1, color: COLORS.white, fontSize: 15 },
    inputError: { borderColor: COLORS.error },
    errorText: { color: COLORS.error, fontSize: 12, marginTop: 4 },
    loginBtn: { backgroundColor: COLORS.gold, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    loginBtnText: { color: '#0D0D1A', fontSize: 16, fontWeight: 'bold' },
    registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    noAccountText: { color: COLORS.textSecondary, fontSize: 14 },
    registerText: { color: COLORS.gold, fontSize: 14, fontWeight: 'bold' },
});
