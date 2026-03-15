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

        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('supabase_auth_uid', uid)
            .single();

        if (!data) {
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
        console.error('[Auth] upsertAndFetchProfile error:', e);
        return { supabase_auth_uid: uid, email, full_name: fullName, avatar_url: avatarUrl };
    }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    // loading = true SOLO durante el arranque inicial
    // Una vez que init() termina, loading queda false PARA SIEMPRE
    const [loading, setLoading] = useState(true);
    const currentUidRef = useRef<string | null>(null);

    useEffect(() => {
        // ── INICIO: verificar sesion existente UNA SOLA VEZ ──
        const init = async () => {
            try {
                const { data: { session: s } } = await supabase.auth.getSession();
                if (s) {
                    currentUidRef.current = s.user.id;
                    setSession(s);
                    const p = await upsertAndFetchProfile(s);
                    if (p) {
                        setProfile(p);
                        registerClientPushToken(p.id).catch(() => {});
                    }
                }
            } catch (e) {
                console.error('[Auth] init error:', e);
            } finally {
                // SIN condiciones - setLoading(false) SIEMPRE se ejecuta
                setLoading(false);
            }
        };

        init();

        // ── LISTENER: cambios de auth ──
        // REGLA CRITICA: este listener NUNCA toca el estado `loading`
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, newSession) => {
                console.log('[Auth] event:', event, newSession?.user?.email ?? '-');

                if (event === 'SIGNED_OUT') {
                    currentUidRef.current = null;
                    clearProfileCache();
                    setSession(null);
                    setProfile(null);
                    return;
                }

                if (event === 'SIGNED_IN' && newSession) {
                    const uid = newSession.user.id;

                    // Mismo usuario con token renovado
                    if (currentUidRef.current === uid && profileCache?.uid === uid) {
                        setSession(newSession);
                        return;
                    }

                    // Usuario nuevo o diferente
                    currentUidRef.current = uid;
                    clearProfileCache();
                    setProfile(null);

                    // Setear sesion INMEDIATAMENTE -> navega a HomeScreen
                    setSession(newSession);

                    // Cargar perfil en background SIN await SIN loading
                    // Usa .then() en lugar de async/await para evitar
                    // cualquier problema con closures o unmounting
                    upsertAndFetchProfile(newSession)
                        .then(p => {
                            if (p) {
                                setProfile(p);
                                registerClientPushToken(p.id).catch(() => {});
                            }
                        })
                        .catch(e => console.error('[Auth] profile bg load error:', e));

                    return;
                }

                if (event === 'TOKEN_REFRESHED' && newSession) {
                    setSession(newSession);
                    return;
                }

                // INITIAL_SESSION: ignorar, ya manejado por init()
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            currentUidRef.current = null;
            clearProfileCache();
            setProfile(null);
            setSession(null);
            await supabase.auth.signOut({ scope: 'local' });
        } catch (e) {
            console.error('[Auth] signOut error:', e);
        }
    };

    const signInWithGoogle = async (): Promise<{ error: string | null }> => {
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

            // En Expo Go: exp://IP:PORT/--/auth/callback
            // Linking.createURL('auth/callback') genera la URL correcta
            const redirectUrl = __DEV__
                ? Linking.createURL('auth/callback')
                : 'turnosync://auth/callback';

            console.log('[OAuth] Platform:', Platform.OS);
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
            if (!data?.url) return { error: 'No se obtuvo URL de autenticacion' };

            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

            if (result.type === 'success') {
                const fragment = result.url.split('#')[1] || '';
                const params = new URLSearchParams(fragment);
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken && refreshToken) {
                    console.log('[OAuth] Tokens encontrados - estableciendo sesion');
                    const { error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });
                    if (sessionError) return { error: sessionError.message };
                    return { error: null };
                }
                return { error: 'Tokens no encontrados' };
            }

            if (result.type === 'cancel') return { error: 'Cancelado por el usuario' };
            return { error: 'Error inesperado' };

        } catch (err: any) {
            console.error('[OAuth] Exception:', err.message);
            return { error: err.message || 'Error inesperado' };
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