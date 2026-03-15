import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { registerClientPushToken } from '../utils/notifications';
import { clearAppointmentsCache } from '../hooks/useMyAppointments';

// 🔴 CRÍTICO: Esto debe estar aquí, no en supabase.ts
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
    session: Session | null;
    profile: any | null;
    loading: boolean;
    signInWithGoogle: () => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (uid: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('supabase_auth_uid', uid)
                .single();
            if (data) {
                const currentSession = (await supabase.auth.getSession()).data.session;
                const fullName = currentSession?.user?.user_metadata?.full_name
                    || currentSession?.user?.user_metadata?.name
                    || data.full_name
                    || '';
                const avatarUrl = currentSession?.user?.user_metadata?.avatar_url
                    || currentSession?.user?.user_metadata?.picture
                    || data.avatar_url
                    || '';
                setProfile({ ...data, full_name: fullName, avatar_url: avatarUrl });
            }
            if (error) console.error('[AuthContext] Error fetching profile:', error.message);
        } catch (e) {
            console.error('[AuthContext] Profile fetch exception:', e);
        }
    };

    useEffect(() => {
        // Inicialización
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) fetchProfile(session.user.id);
            setLoading(false);
        });

        // Escucha cambios de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

            if (event === 'SIGNED_OUT') {
                setSession(null);
                setProfile(null);
                setLoading(false);
                return;
            }

            setSession(session);

            if (session?.user) {
                const fullName = session.user.user_metadata?.full_name
                    || session.user.user_metadata?.name
                    || '';
                const avatarUrl = session.user.user_metadata?.avatar_url
                    || session.user.user_metadata?.picture
                    || '';

                // Perfil inmediato desde metadata
                setProfile((prev: any) => ({
                    ...(prev ?? {}),
                    supabase_auth_uid: session.user.id,
                    email: session.user.email ?? '',
                    full_name: fullName,
                    avatar_url: avatarUrl,
                }));

                // Sincronizar con DB
                try {
                    await supabase.from('users').upsert({
                        supabase_auth_uid: session.user.id,
                        email: session.user.email ?? '',
                        full_name: fullName,
                        avatar_url: avatarUrl,
                    }, { onConflict: 'supabase_auth_uid' });

                    const { data: dbProfile } = await supabase
                        .from('users')
                        .select('*')
                        .eq('supabase_auth_uid', session.user.id)
                        .single();

                    if (dbProfile) {
                        setProfile({
                            ...dbProfile,
                            full_name: fullName || dbProfile.full_name,
                            avatar_url: avatarUrl || dbProfile.avatar_url,
                        });
                        registerClientPushToken(dbProfile.id).catch(() => {});
                    }
                } catch (e) {
                    console.error('[AuthContext] Error sync DB:', e);
                }
            } else {
                setProfile(null);
            }

            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async (): Promise<{ error: string | null }> => {
        try {
            console.log('[OAuth] Detectando plataforma...');
            console.log('[OAuth] Platform.OS:', Platform.OS);

            // ════════════════════════════════════════════════════════════
            // 🌐 WEB: Flujo directo sin WebBrowser
            // ════════════════════════════════════════════════════════════
            if (Platform.OS === 'web') {
                console.log('[OAuth] 🌐 WEB - usando flujo web puro');

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
                    console.error('[OAuth] Error en web:', error.message);
                    return { error: error.message };
                }

                // En web, Supabase redirige automáticamente
                return { error: null };
            }

            // ════════════════════════════════════════════════════════════
            // 📱 MÓVIL (Android/iOS): WebBrowser + Deep Linking
            // ════════════════════════════════════════════════════════════
            console.log('[OAuth] 📱 MÓVIL - usando WebBrowser + deep linking');

            // MANTENER tu estructura de __DEV__
            const redirectUrl = __DEV__
                ? Linking.createURL('auth/callback')   // exp://IP:puerto/--/auth/callback en Expo Go
                : 'turnosync://auth/callback';          // turnosync:// en build de producción

            console.log('[OAuth] Redirect URL:', redirectUrl);
            console.log('[OAuth] __DEV__:', __DEV__);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,  // Abrimos el browser nosotros
                    queryParams: {
                        prompt: 'select_account',
                    },
                },
            });

            if (error) {
                console.error('[OAuth] Error en móvil:', error.message);
                return { error: error.message };
            }

            if (!data?.url) {
                console.error('[OAuth] No URL recibida de Supabase');
                return { error: 'No se recibió URL de autenticación' };
            }

            console.log('[OAuth] ✅ URL recibida - abriendo WebBrowser');

            // Abrir el browser nativo
            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
            console.log('[OAuth] Resultado del browser:', result.type);

            if (result.type === 'success' && result.url) {
                const { url } = result;

                // Supabase devuelve tokens en el fragmento (#)
                const fragment = url.split('#')[1] || url.split('?')[1] || '';
                const params = new URLSearchParams(fragment);

                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken && refreshToken) {
                    console.log('[OAuth] ✅ Tokens encontrados - estableciendo sesión');

                    const { error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });

                    if (sessionError) {
                        console.error('[OAuth] Error al establecer sesión:', sessionError.message);
                        return { error: sessionError.message };
                    }

                    console.log('[OAuth] ✅ Sesión establecida correctamente');
                    return { error: null };
                } else {
                    console.error('[OAuth] ❌ Tokens NO encontrados en:', url);
                    return { error: 'Tokens no encontrados en la respuesta' };
                }
            }

            if (result.type === 'cancel') {
                console.log('[OAuth] Usuario canceló el login');
                return { error: 'Cancelado por el usuario' };
            }

            console.warn('[OAuth] Resultado inesperado:', result);
            return { error: 'Error inesperado' };

        } catch (err: any) {
            console.error('[signInWithGoogle] Exception:', err.message);
            return { error: err.message || 'Error inesperado en Google Sign In' };
        }
    };

    const signOut = async () => {
        try {
            // Limpiar estado local ANTES de llamar a Supabase
            // para que la UI reaccione inmediatamente
            setProfile(null);
            setSession(null);
            clearAppointmentsCache();

            // Llamar signOut en Supabase
            await supabase.auth.signOut({ scope: 'local' });
        } catch (e) {
            console.error('[Auth] Error en signOut:', e);
        }
    };

    return (
        <AuthContext.Provider value={{ session, profile, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};