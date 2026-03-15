import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { registerClientPushToken } from '../utils/notifications';

interface AuthContextType {
    session: Session | null;
    profile: any | null;
    loading: boolean;
    signInWithGoogle: () => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Cache de perfil para evitar re-fetches innecesarios
let profileCache: { uid: string; data: any } | null = null;

export function clearProfileCache() {
    profileCache = null;
}

async function upsertAndFetchProfile(session: Session): Promise<any | null> {
    const uid = session.user.id;
    const fullName = session.user.user_metadata?.full_name
        || session.user.user_metadata?.name
        || '';
    const avatarUrl = session.user.user_metadata?.avatar_url
        || session.user.user_metadata?.picture
        || '';
    const email = session.user.email ?? '';

    if (profileCache?.uid === uid) {
        return profileCache.data;
    }

    try {
        await supabase.from('users').upsert(
            { supabase_auth_uid: uid, email, full_name: fullName, avatar_url: avatarUrl },
            { onConflict: 'supabase_auth_uid' }
        );

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('supabase_auth_uid', uid)
            .single();

        if (error || !data) {
            return { supabase_auth_uid: uid, email, full_name: fullName, avatar_url: avatarUrl };
        }

        const profile = {
            ...data,
            full_name: fullName || data.full_name,
            avatar_url: avatarUrl || data.avatar_url,
        };

        profileCache = { uid, data: profile };
        return profile;
    } catch (e) {
        console.error('[AuthContext] Exception en upsertAndFetchProfile:', e);
        return null;
    }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    // Usar ref para acceder al uid actual sin closure stale
    const currentUidRef = useRef<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                const { data: { session: existingSession } } = await supabase.auth.getSession();

                if (!mounted) return;

                if (existingSession) {
                    currentUidRef.current = existingSession.user.id;
                    setSession(existingSession);
                    const p = await upsertAndFetchProfile(existingSession);
                    if (mounted && p) {
                        setProfile(p);
                        registerClientPushToken(p.id).catch(() => {});
                    }
                }
            } catch (e) {
                console.error('[AuthContext] Error en init:', e);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                if (!mounted) return;
                console.log('[AuthContext] Auth event:', event, newSession?.user?.email ?? 'no session');

                if (event === 'SIGNED_OUT') {
                    currentUidRef.current = null;
                    clearProfileCache();
                    setSession(null);
                    setProfile(null);
                    setLoading(false);
                    return;
                }

                if (event === 'SIGNED_IN') {
                    if (!newSession) return;

                    const newUid = newSession.user.id;

                    // Mismo usuario ya logueado: solo refrescar sesion
                    if (currentUidRef.current === newUid && profileCache?.uid === newUid) {
                        setSession(newSession);
                        return;
                    }

                    // Usuario diferente o primera vez
                    currentUidRef.current = newUid;
                    clearProfileCache();
                    setProfile(null);
                    setSession(newSession);
                    setLoading(true);

                    try {
                        const p = await upsertAndFetchProfile(newSession);
                        if (mounted && p) {
                            setProfile(p);
                            registerClientPushToken(p.id).catch(() => {});
                        }
                    } catch (e) {
                        console.error('[AuthContext] Error cargando perfil:', e);
                    } finally {
                        if (mounted) setLoading(false);
                    }
                    return;
                }

                if (event === 'TOKEN_REFRESHED' && newSession) {
                    setSession(newSession);
                    return;
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            // Limpiar estado inmediatamente para que la UI reaccione
            currentUidRef.current = null;
            clearProfileCache();
            setProfile(null);
            setSession(null);
            setLoading(false); // CRITICO: asegurar que loading quede en false
            // Luego limpiar en Supabase
            await supabase.auth.signOut({ scope: 'local' });
        } catch (e) {
            console.error('[Auth] Error en signOut:', e);
            // Aunque falle, el estado local ya esta limpio
            setLoading(false);
        }
    };

    const signInWithGoogle = async (): Promise<{ error: string | null }> => {
        try {
            console.log('[OAuth] Detectando plataforma...');
            console.log('[OAuth] Platform.OS:', Platform.OS);

            if (Platform.OS === 'web') {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                        queryParams: { prompt: 'select_account' },
                    },
                });
                if (error) return { error: error.message };
                return { error: null };
            }

            console.log('[OAuth] 📱 MÓVIL - usando WebBrowser + deep linking');
            const redirectUrl = __DEV__
                ? Linking.createURL('/--/auth/callback')
                : 'turnosync://auth/callback';

            console.log('[OAuth] Redirect URL:', redirectUrl);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    queryParams: { prompt: 'select_account', access_type: 'offline' },
                    skipBrowserRedirect: true,
                },
            });

            if (error) return { error: error.message };
            if (!data?.url) return { error: 'No se obtuvo URL de autenticación' };

            console.log('[OAuth] ✅ URL recibida - abriendo WebBrowser');
            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

            if (result.type === 'success') {
                console.log('[OAuth] Resultado del browser: success');
                const fragment = result.url.split('#')[1] || '';
                const params = new URLSearchParams(fragment);
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken && refreshToken) {
                    console.log('[OAuth] ✅ Tokens encontrados - estableciendo sesión');
                    const { error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });
                    if (sessionError) return { error: sessionError.message };
                    return { error: null };
                }
                return { error: 'Tokens no encontrados en la respuesta' };
            }

            if (result.type === 'cancel') return { error: 'Cancelado por el usuario' };
            return { error: 'Error inesperado' };

        } catch (err: any) {
            console.error('[signInWithGoogle] Exception:', err.message);
            return { error: err.message || 'Error inesperado en Google Sign In' };
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
    if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return context;
};