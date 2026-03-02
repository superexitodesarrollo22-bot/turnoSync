import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

export default function EmailLoginScreen() {
    const navigation = useNavigation<any>();
    const { colors, isDark } = useTheme();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <StatusBar style={isDark ? "light" : "dark"} />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Sign In</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>Welcome Back</Text>
                    <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>Enter your details to access your profile</Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textPrimary }]}>Email Address</Text>
                        <View style={[
                            styles.inputWrapper,
                            {
                                backgroundColor: colors.inputBackground,
                                borderColor: colors.border,
                                elevation: isDark ? 0 : 1,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: isDark ? 0 : 0.05,
                                shadowRadius: 2,
                            },
                            emailError ? styles.inputError : null
                        ]}>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                placeholder="name@example.com"
                                placeholderTextColor={colors.textMuted}
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
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Password</Text>
                            <TouchableOpacity onPress={handleForgotPassword}>
                                <Text style={[styles.forgotText, { color: colors.accent }]}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[
                            styles.inputWrapper,
                            {
                                backgroundColor: colors.inputBackground,
                                borderColor: colors.border,
                                elevation: isDark ? 0 : 1,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: isDark ? 0 : 0.05,
                                shadowRadius: 2,
                            },
                            passwordError ? styles.inputError : null
                        ]}>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                placeholder="Min. 6 characters"
                                placeholderTextColor={colors.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Feather
                                    name={showPassword ? "eye" : "eye-off"}
                                    size={20}
                                    color={colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.loginBtn,
                            {
                                backgroundColor: colors.accent,
                                elevation: isDark ? 0 : 4,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 3 },
                                shadowOpacity: isDark ? 0 : 0.1,
                                shadowRadius: 6,
                            }
                        ]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={isDark ? "#0D0D1A" : "#FFFFFF"} />
                        ) : (
                            <Text style={[styles.loginBtnText, { color: isDark ? "#0D0D1A" : "#FFFFFF" }]}>Login</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <Text style={[styles.noAccountText, { color: colors.textSecondary }]}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={[styles.registerText, { color: colors.accent }]}>Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    form: { marginTop: 40, paddingHorizontal: 24 },
    welcomeTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    welcomeSubtitle: { fontSize: 14, marginBottom: 30 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    forgotText: { fontSize: 13, fontWeight: '500' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, height: 56 },
    input: { flex: 1, fontSize: 15 },
    inputError: { borderColor: '#FF6B6B' },
    errorText: { color: '#FF6B6B', fontSize: 12, marginTop: 4 },
    loginBtn: { height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    loginBtnText: { fontSize: 16, fontWeight: 'bold' },
    registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    noAccountText: { fontSize: 14 },
    registerText: { fontSize: 14, fontWeight: 'bold' },
});
