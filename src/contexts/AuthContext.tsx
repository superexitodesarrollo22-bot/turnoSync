import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { AppState, AppStateStatus, Platform, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// IMPORTANTE: Configurar WebBrowser
WebBrowser.maybeCompleteAuthSession();

interface UserProfile {
    id: string;
    supabase_auth_uid: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Función para obtener el redirect URL correcto según el entorno
    const getRedirectUrl = () => {
        // En desarrollo con Expo Go
        if (__DEV__) {
            const redirectUrl = Linking.createURL('auth/callback');
            console.log('🔗 [DEV] Redirect URL:', redirectUrl);
            return redirectUrl;
        }

        // En producción (APK)
        const redirectUrl = 'turnosync://auth/callback';
        console.log('🔗 [PROD] Redirect URL:', redirectUrl);
        return redirectUrl;
    };

    // Cargar perfil del usuario
    const loadUserProfile = async (authUid: string, attempt = 1): Promise<void> => {
        const MAX_ATTEMPTS = 5;
        const RETRY_DELAY = 2000;

        console.log(`🔍 [Intento ${attempt}/${MAX_ATTEMPTS}] Cargando perfil para UID: ${authUid}`);

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('supabase_auth_uid', authUid)
                .single();

            if (error) {
                console.error(`❌ Error al cargar perfil (intento ${attempt}):`, error.message);

                if ((error.code === 'PGRST116' || error.message.includes('no rows')) && attempt < MAX_ATTEMPTS) {
                    console.log(`⏳ Usuario no encontrado, reintentando en ${RETRY_DELAY / 1000}s...`);
                    setTimeout(() => {
                        loadUserProfile(authUid, attempt + 1);
                    }, RETRY_DELAY);
                    return;
                }

                if (attempt >= MAX_ATTEMPTS) {
                    console.error('❌ Se agotaron los intentos. Usuario no se creó en public.users');
                    console.error('💡 Verifica que el trigger de Supabase esté funcionando');
                    setLoading(false);
                    return;
                }

                throw error;
            }

            console.log('✅ Perfil cargado exitosamente:', data);
            setProfile(data);
            setLoading(false);
        } catch (error) {
            console.error('❌ Error fatal al cargar perfil:', error);
            setLoading(false);
        }
    };

    // Login con Google
    const signInWithGoogle = async () => {
        try {
            setLoading(true);
            console.log('🔐 Iniciando login con Google...');
            console.log('📱 Entorno:', __DEV__ ? 'DESARROLLO' : 'PRODUCCIÓN');
            console.log('📱 Platform:', Platform.OS);

            const redirectUrl = getRedirectUrl();

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (error) {
                console.error('❌ Error en signInWithOAuth:', error);
                throw error;
            }

            console.log('🌐 Abriendo navegador para OAuth...');
            console.log('🔗 URL de OAuth:', data.url);

            const result = await WebBrowser.openAuthSessionAsync(
                data.url,
                redirectUrl,
                {
                    showInRecents: true,
                }
            );

            console.log('📱 Resultado del navegador:', result.type);

            if (result.type === 'success') {
                const url = result.url;
                const fragment = url.split('#')[1] ?? '';
                const params = new URLSearchParams(fragment || url.split('?')[1] || '');
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken && refreshToken) {
                    console.log('✅ Tokens recibidos, configurando sesión...');
                    await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
                } else {
                    console.warn('⚠️ No se encontraron tokens en la URL de retorno');
                    setLoading(false);
                }
            } else if (result.type === 'cancel') {
                console.log('🚫 Usuario canceló el login');
                setLoading(false);
            } else {
                setLoading(false);
            }

        } catch (error: any) {
            console.error('❌ Error fatal en signInWithGoogle:', error);
            Alert.alert('Error', error.message || 'No se pudo iniciar sesión.');
            setLoading(false);
        }
    };

    // Monitor de estado de la app
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active' && session && !profile) {
                console.log('📱 App volvió a foreground, verificando sesión...');
                supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
                    if (currentSession?.user) {
                        console.log('🔄 Reintentando cargar perfil...');
                        loadUserProfile(currentSession.user.id);
                    }
                });
            }
        });

        return () => {
            subscription.remove();
        };
    }, [session, profile]);

    // Inicialización y listeners de autenticación
    useEffect(() => {
        console.log('🚀 Inicializando AuthContext...');
        console.log('📱 Entorno de ejecución:', __DEV__ ? 'DESARROLLO' : 'PRODUCCIÓN');

        supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
            console.log('📱 Sesión inicial:', initialSession ? '✅ Existe' : '❌ No existe');

            setSession(initialSession);
            setUser(initialSession?.user ?? null);

            if (initialSession?.user) {
                console.log('👤 Usuario encontrado, cargando perfil...');
                loadUserProfile(initialSession.user.id);
            } else {
                console.log('👤 No hay usuario, finalizando carga...');
                setLoading(false);
            }
        }).catch((error) => {
            console.error('❌ Error al obtener sesión inicial:', error);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('🔐 Evento de Auth:', event);
                console.log('👤 Nueva sesión:', newSession ? '✅ Existe' : '❌ No existe');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

                setSession(newSession);
                setUser(newSession?.user ?? null);

                if (event === 'SIGNED_IN' && newSession?.user) {
                    console.log('✅ Usuario inició sesión, cargando perfil...');
                    setLoading(true);
                    await loadUserProfile(newSession.user.id);
                } else if (event === 'SIGNED_OUT') {
                    console.log('👋 Usuario cerró sesión');
                    setProfile(null);
                    setLoading(false);
                } else if (event === 'TOKEN_REFRESHED') {
                    console.log('🔄 Token refrescado');
                }
            }
        );

        return () => {
            console.log('🧹 Limpiando suscripción de auth...');
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            console.log('👋 Cerrando sesión...');
            setLoading(true);
            const { error } = await supabase.auth.signOut();

            if (error) throw error;

            console.log('✅ Sesión cerrada exitosamente');
            setProfile(null);
            setUser(null);
            setSession(null);
        } catch (error) {
            console.error('❌ Error en signOut:', error);
        } finally {
            setLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        session,
        profile,
        loading,
        signInWithGoogle,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};
