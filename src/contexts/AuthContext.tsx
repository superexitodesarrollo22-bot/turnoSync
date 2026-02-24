import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import * as WebBrowser from 'expo-web-browser';
import { Session } from '@supabase/supabase-js';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
    session: Session | null;
    user: any | null;
    profile: any | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUserProfile = async (authUid: string, retries = 5) => {
        try {
            console.log('Intentando cargar perfil para:', authUid);
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('supabase_auth_uid', authUid)
                .single();

            if (error) {
                console.warn('Error loading profile (retries left: ' + retries + '):', error.message);
                if (retries > 0) {
                    // Esperar 2 segundos y reintentar si el perfil no existe aún
                    // (Útil si el trigger de Supabase está trabajando)
                    setTimeout(() => loadUserProfile(authUid, retries - 1), 2000);
                    return;
                }
                setProfile(null);
                setLoading(false);
                return;
            }

            console.log('Perfil cargado exitosamente:', data);
            setProfile(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fatal en loadUserProfile:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        // Obtener sesión inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('Sesión inicial:', session?.user?.email);
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadUserProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Evento de Auth:', event);
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await loadUserProfile(session.user.id);
            } else {
                setProfile(null);
                if (event === 'SIGNED_OUT') {
                    setLoading(false);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            const redirectTo = 'turnosync://auth/callback';
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo, skipBrowserRedirect: true, queryParams: { prompt: 'select_account' } },
            });

            if (error) throw error;
            if (!data?.url) return;

            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

            if (result.type === 'success') {
                const url = result.url;
                const fragment = url.split('#')[1] ?? '';
                const params = new URLSearchParams(fragment || url.split('?')[1] || '');
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken && refreshToken) {
                    setLoading(true); // Activar loading mientras procesamos el setSession
                    await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
                }
            }
        } catch (error) {
            console.error('Error en signInWithGoogle:', error);
            throw error;
        }
    };

    const signOut = async () => {
        setLoading(true);
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, profile, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
