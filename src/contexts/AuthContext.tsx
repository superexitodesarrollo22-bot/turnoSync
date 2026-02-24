import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import * as WebBrowser from 'expo-web-browser';
import { Session } from '@supabase/supabase-js';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
    session: Session | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setLoading(false);
            if (_event === 'SIGNED_IN' && session) {
                try {
                    await supabase.from('users').upsert({
                        supabase_auth_uid: session.user.id,
                        email: session.user.email ?? '',
                        full_name: session.user.user_metadata?.full_name ?? '',
                        avatar_url: session.user.user_metadata?.avatar_url ?? '',
                    }, { onConflict: 'supabase_auth_uid' });
                } catch (e) {
                    console.log('upsert error (non blocking):', e);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const redirectTo = 'turnosync://auth/callback';
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo, skipBrowserRedirect: true, queryParams: { prompt: 'select_account' } },
        });
        if (error || !data?.url) return;
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type === 'success') {
            const url = result.url;
            const fragment = url.split('#')[1] ?? '';
            const params = new URLSearchParams(fragment || url.split('?')[1] || '');
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            if (accessToken && refreshToken) {
                await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
            }
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
