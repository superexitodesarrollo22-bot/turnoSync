import { createClient } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';

// CRÍTICO: esta línea cierra el browser y regresa a la app correctamente
WebBrowser.maybeCompleteAuthSession();

export const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            detectSessionInUrl: false, // siempre false en React Native
            persistSession: true,
            autoRefreshToken: true,
        },
    }
);
