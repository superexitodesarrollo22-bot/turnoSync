import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
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

let profileCache: { uid: string; data: any } | null = null;

export function clearProfileCache() {
    profileCache = null;
}

async function upsertAndFetchProfile(session: Session): Promise<any | null> {
    const uid = session.user.id;
    const fullName = session.user.user_metadata?.full_name
        || session.user.user_metadata?.name || '';
    const avatarUrl = session.user.user_metadata?.avatar_url
        || session.user.user_metadata?.picture || '';
    const email = session.user.email ?? '';

    if (profileCache?.uid === uid) return profileCache.data;

    try {
        await supabase.from('users').upsert(
            { supabase_auth_uid: uid, email, full_name: fullName, avatar_url: avatarUrl },
            { onConflict: 'supabase_auth_uid' }
        );
        const { data, error } = await supabase
            .from('users').select('*')
            .eq('supabase_auth_uid', uid).single();

        if (error || !data) {
            return { supabase_auth_uid: uid, email, full_name: fullName, avatar_url: avatarUrl };
        }
        const p = { ...data, full_name: fullName || data.full_name, avatar_url: avatarUrl || data.avatar_url };
        profileCache = { uid, data: p };
        return p;
    } catch (e) {
        console.error('[AuthContext] upsertAndFetchProfile error:', e);
        return null;
    }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const currentUidRef = useRef<string | null>(null);
    // Esta ref NO se usa para bloquear setState - siempre podemos hacer setState
    // Solo la usamos para evitar work innecesario si el componente no existe
    const isMountedRef = useRef(true);

    const handleSignedIn = useCallback(async (newSession: Session) => {
        const newUid = newSession.user.id;

        // Mismo usuario y perfil cacheado: no recargar
        if (currentUidRef.current === newUid && profileCache?.uid === newUid) {
            setSession(newSession);
            return;
        }

        // Nuevo usuario
        currentUidRef.current = newUid;
        clearProfileCache();
        setProfile(null);
        setSession(newSession);
        setLoading(true);

        try {
            const p = await upsertAndFetchProfile(newSession);
            // CRITICO: setear estado SIEMPRE, no condicionado a isMounted
            // React maneja el caso de componente desmontado silenciosamente
            if (p) {
                setProfile(p);
                registerClientPushToken(p.id).catch(() => {});
            }
        } catch (e) {
            console.error('[AuthContext] Error en handleSignedIn:', e);
        } finally {
            // SIEMPRE poner loading en false, sin condicion
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        isMountedRef.current = true;

        const init = async () => {
            try {
                const { data: { session: s } } = await supabase.auth.getSession();
                if (s) {
                    await handleSignedIn(s);
                } else {
                    setLoading(false);
                }
            } catch (e) {
                console.error('[AuthContext] init error:', e);
                setLoading(false);
            }
        };

        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                console.log('[AuthContext] Auth event:', event, newSession?.user?.email ?? 'no session');

                if (event === 'SIGNED_OUT') {
                    currentUidRef.current = null;
                    clearProfileCache();
                    setSession(null);
                    setProfile(null);
                    setLoading(false);
                    return;
                }

                if (event === 'SIGNED_IN' && newSession) {
                    await handleSignedIn(newSession);
                    return;
                }

                if (event === 'TOKEN_REFRESHED' && newSession) {
                    setSession(newSession);
                    return;
                }

                if (event === 'INITIAL_SESSION') {
                    // Ya manejado por init(), ignorar para evitar doble carga
                    return;
                }
            }
        );

        return () => {
            isMountedRef.current = false;
            subscription.unsubscribe();
        };
    }, [handleSignedIn]);

    const signOut = useCallback(async () => {
        try {
            currentUidRef.current = null;
            clearProfileCache();
            setProfile(null);
            setSession(null);
            setLoading(false);
            await supabase.auth.signOut({ scope: 'local' });
        } catch (e) {
            console.error('[Auth] signOut error:', e);
            setLoading(false);
        }
    }, []);

    const signInWithGoogle = useCallback(async (): Promise<{ error: string | null }> => {
        try {
            if (Platform.OS === 'web') {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                        queryParams: { prompt: 'select_account' },
                    },
                });
                return { error: error?.message ?? null };
            }

            // Movil: usar deep link correcto sin doble --
            // En Expo Go: exp://IP:PORT/--/auth/callback (un solo --)
            const redirectUrl = __DEV__
                ? `${Linking.createURL('auth/callback')}`
                : 'turnosync://auth/callback';

            console.log('[OAuth] Redirect URL:', redirectUrl);
            console.log('[OAuth] __DEV__:', __DEV__);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    queryParams: { prompt: 'select_account', access_type: 'offline' },
                    skipBrowserRedirect: true,
                },
            });

            if (error) return { error: error.message };
            if (!data?.url) return { error: 'No se obtuvo URL de autenticacion' };

            console.log('[OAuth] ✅ URL recibida - abriendo WebBrowser');
            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

            if (result.type === 'success') {
                console.log('[OAuth] Resultado del browser: success');
                const fragment = result.url.split('#')[1] || '';
                const params = new URLSearchParams(fragment);
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken && refreshToken) {
                    console.log('[OAuth] ✅ Tokens encontrados - estableciendo sesion');
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
            return { error: err.message || 'Error inesperado en Google Sign In' };
        }
    }, []);

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