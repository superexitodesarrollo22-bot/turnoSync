import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';

// ─── Google OAuth ─────────────────────────────────────────────

/**
 * Initiates Google OAuth flow via Supabase with robust WebBrowser handling.
 */
export async function signInWithGoogle(): Promise<{
    error: string | null;
}> {
    try {
        // 1. URL de redirección fija para producción
        const redirectUrl = 'turnosync://auth/callback';
        console.log('[Login] Production Redirect URL:', redirectUrl);


        // 2. Iniciar el flujo de OAuth con Supabase
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: true, // Crucial: nos permite abrir el browser nosotros
                queryParams: {
                    prompt: 'select_account',
                },
            },
        });

        if (error) throw error;
        if (!data?.url) throw new Error('No se recibió la URL de autenticación');

        // 3. Abrir el selector de cuenta en el browser nativo
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

        console.log('[Login] WebBrowser Result:', result.type);

        // 4. Manejar el retorno exitoso
        if (result.type === 'success' && result.url) {
            const { url } = result;

            // Supabase devuelve los tokens en el fragmento (#)
            const fragment = url.split('#')[1] || url.split('?')[1] || '';
            const params = new URLSearchParams(fragment);

            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
                console.log('[Login] Tokens extraídos con éxito. Estableciendo sesión...');
                const { error: sessionError } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                });
                if (sessionError) throw sessionError;

                return { error: null };
            } else {
                return { error: 'No se encontraron tokens en la respuesta' };
            }
        }

        if (result.type === 'cancel') {
            return { error: 'Cancelado por el usuario' };
        }

        return { error: null };
    } catch (err: any) {
        console.error('[signInWithGoogle] Error:', err.message);
        return { error: err.message || 'Error inesperado en Google Sign In' };
    }
}


// ─── User Upsert ──────────────────────────────────────────────

/**
 * Upserts the authenticated user into the public `users` table.
 * Called after successful Google OAuth.
 */
export async function upsertUser(): Promise<void> {
    const {
        data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return;

    const { error } = await supabase.from('users').upsert(
        {
            supabase_auth_uid: authUser.id,
            email: authUser.email ?? '',
            full_name:
                authUser.user_metadata?.full_name ??
                authUser.user_metadata?.name ??
                null,
            avatar_url: authUser.user_metadata?.avatar_url ?? null,
        },
        {
            onConflict: 'supabase_auth_uid',
            ignoreDuplicates: false,
        }
    );

    if (error) {
        console.error('[upsertUser] Error:', error.message);
    }
}

// ─── Push Token Registration ──────────────────────────────────

/**
 * Registers the device's Expo push token in `user_devices`.
 * Only runs on physical devices.
 */
export async function registerPushToken(): Promise<void> {
    if (!Device.isDevice) {
        console.log('[Push] Skipping — not a physical device');
        return;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('[Push] Permission not granted');
        return;
    }

    // Android channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'TurnoSync',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#6C63FF',
        });
    }

    try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        const expoPushToken = tokenData.data;

        // Get current user
        const {
            data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser) return;

        // Fetch internal user id
        const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('supabase_auth_uid', authUser.id)
            .single();

        if (!userData?.id) return;

        // Upsert device token
        const { error } = await supabase.from('user_devices').upsert(
            {
                user_id: userData.id,
                expo_push_token: expoPushToken,
            },
            { onConflict: 'user_id,expo_push_token', ignoreDuplicates: true }
        );

        if (error) {
            console.error('[Push] Token registration error:', error.message);
        } else {
            console.log('[Push] Token registered:', expoPushToken);
        }
    } catch (err) {
        console.error('[Push] getExpoPushTokenAsync error:', err);
    }
}
