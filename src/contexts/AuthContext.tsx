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
    signInWithGoogle: () => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    signInWithGoogle: async () => ({ error: null }),
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

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
    const signInWithGoogle = async (): Promise<{ error: string | null }> => {
        try {
            setLoading(true);
            console.log('🔐 Iniciando login con Google...');
            console.log('📱 Entorno:', __DEV__ ? 'DESARROLLO' : 'PRODUCCIÓN');
            console.log('📱 Platform:', Platform.OS);

            // ════════════════════════════════════════════════════════════════
            // 🌐 WEB: Usar signInWithOAuth directo
            // ════════════════════════════════════════════════════════════════
            if (Platform.OS === 'web') {
                console.log('[OAuth] Web detected - usando flujo web puro');

                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                        queryParams: {
                            prompt: 'select_account',
                        },
                    },
                });

                if (error) {
                    console.error('[OAuth] Error web:', error.message);
                    setLoading(false);
                    return { error: error.message };
                }

                return { error: null };
            }

            // ════════════════════════════════════════════════════════════════
            // 📱 MÓVIL: Usar WebBrowser + deep linking
            // ════════════════════════════════════════════════════════════════
            console.log('[OAuth] Mobile detected - usando WebBrowser + deep linking');

            const redirectUrl = __DEV__
                ? Linking.createURL('auth/callback')
                : 'turnosync://auth/callback';

            console.log('[OAuth] Redirect URL:', redirectUrl);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                    queryParams: {
                        prompt: 'select_account',
                    },
                },
            });

            if (error) {
                console.error('[OAuth] Error mobile:', error.message);
                setLoading(false);
                return { error: error.message };
            }

            if (!data?.url) {
                setLoading(false);
                return { error: 'No se recibió la URL de autenticación' };
            }

            console.log('[OAuth] Abriendo browser...');
            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

            console.log('[OAuth] Browser result:', result.type);

            if (result.type === 'success' && result.url) {
                console.log('[OAuth] Éxito - extrayendo tokens...');
                const { url } = result;

                const fragment = url.split('#')[1] || url.split('?')[1] || '';
                const params = new URLSearchParams(fragment);

                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken && refreshToken) {
                    console.log('[OAuth] Tokens extraídos - estableciendo sesión...');
                    const { error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });

                    if (sessionError) {
                        console.error('[OAuth] Error al establecer sesión:', sessionError.message);
                        setLoading(false);
                        return { error: sessionError.message };
                    }

                    console.log('[OAuth] ✅ Sesión establecida correctamente');
                    return { error: null };
                } else {
                    console.error('[OAuth] Tokens no encontrados en la respuesta');
                    setLoading(false);
                    return { error: 'No se encontraron tokens' };
                }
            }

            if (result.type === 'cancel') {
                console.log('[OAuth] Usuario canceló el login');
                setLoading(false);
                return { error: 'Cancelado por el usuario' };
            }

            setLoading(false);
            return { error: 'Error inesperado' };

        } catch (error: any) {
            console.error('❌ Error fatal en signInWithGoogle:', error);
            setLoading(false);
            return { error: error.message || 'Error inesperado en Google Sign In' };
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
                    loadUserProfile(newSession.user.id);

                    // Sincronizar usuario con tabla pública (upsert)
                    try {
                        await supabase.from('users').upsert({
                            supabase_auth_uid: newSession.user.id,
                            email: newSession.user.email ?? '',
                            full_name: newSession.user.user_metadata?.full_name ?? '',
                            avatar_url: newSession.user.user_metadata?.avatar_url ?? '',
                        }, { onConflict: 'supabase_auth_uid' });
                    } catch (e) {
                        console.log('[AuthContext] upsert error (non blocking):', e);
                    }
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
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
