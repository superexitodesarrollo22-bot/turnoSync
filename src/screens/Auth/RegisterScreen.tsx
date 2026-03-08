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
import { supabase } from '../../services/supabase';
import { useTheme } from '../../hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../../hooks/useToast';
import { StatusBar } from 'expo-status-bar';

export default function RegisterScreen() {
    const navigation = useNavigation<any>();
    const { colors, isDark } = useTheme();
    const { showToast } = useToast();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [errors, setErrors] = useState({
        fullName: '',
        email: '',
        password: '',
    });

    const validate = () => {
        let valid = true;
        let newErrors = { fullName: '', email: '', password: '' };

        if (!fullName) {
            newErrors.fullName = 'Full name is required';
            valid = false;
        }

        if (!email) {
            newErrors.email = 'Email is required';
            valid = false;
        } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/.test(email)) {
            newErrors.email = 'Enter a valid email';
            valid = false;
        }

        if (!password) {
            newErrors.password = 'Password is required';
            valid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        try {
            setIsLoading(true);
            const { error, data } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            });

            if (error) {
                showToast({ type: 'error', message: error.message });
            } else if (data?.user) {
                showToast({ type: 'success', message: 'Account created! If email confirmation is enabled, check your inbox.' });
                navigation.navigate('Login');
            }
        } catch (error: any) {
            showToast({ type: 'error', message: error.message || 'Could not create account' });
        } finally {
            setIsLoading(false);
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
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Create Account</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>Join TurnoSync</Text>
                    <Text style={[styles.subTitle, { color: colors.textSecondary }]}>Set up your profile to start booking</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Full Name */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textPrimary }]}>Full Name</Text>
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
                            errors.fullName ? styles.inputError : null
                        ]}>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                placeholder="John Doe"
                                placeholderTextColor={colors.textMuted}
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>
                        {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
                    </View>

                    {/* Email */}
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
                            errors.email ? styles.inputError : null
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
                        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textPrimary }]}>Password</Text>
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
                            errors.password ? styles.inputError : null
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
                        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        style={[
                            styles.registerBtn,
                            {
                                backgroundColor: colors.accent,
                                elevation: isDark ? 0 : 4,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 3 },
                                shadowOpacity: isDark ? 0 : 0.1,
                                shadowRadius: 6,
                            }
                        ]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={isDark ? "#0D0D1A" : "#FFFFFF"} />
                        ) : (
                            <Text style={[styles.registerBtnText, { color: isDark ? "#0D0D1A" : "#FFFFFF" }]}>Create Account</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                        <Text style={[styles.hasAccountText, { color: colors.textSecondary }]}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={[styles.loginText, { color: colors.accent }]}>Login</Text>
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
    titleSection: { marginTop: 30, paddingHorizontal: 24 },
    mainTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
    subTitle: { fontSize: 14 },
    form: { marginTop: 40, paddingHorizontal: 24 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, height: 56 },
    input: { flex: 1, fontSize: 15 },
    inputError: { borderColor: '#FF6B6B' },
    errorText: { color: '#FF6B6B', fontSize: 12, marginTop: 4 },
    registerBtn: { height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
    registerBtnText: { fontSize: 16, fontWeight: 'bold' },
    loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    hasAccountText: { fontSize: 14 },
    loginText: { fontSize: 14, fontWeight: 'bold' },
});
