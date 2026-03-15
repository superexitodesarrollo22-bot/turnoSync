import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ToastProvider } from './src/contexts/ToastContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import AuthCallbackScreen from './src/screens/Auth/AuthCallbackScreen';
import SplashAnimatedScreen from './src/screens/SplashAnimatedScreen';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { initNotifications } from './src/utils/notifications';

initNotifications();

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [
    'turnosync://',
    'exp://',
    Linking.createURL('/'),
  ],
  config: {
    screens: {
      AuthCallback: 'auth/callback',
    },
  },
};

function RootNavigator() {
  const { session, loading } = useAuth();
  // splashDone: solo controla si se mostro la animacion inicial
  // Se resetea cuando session cambia a null (cierre de sesion)
  const [splashDone, setSplashDone] = React.useState(false);
  const prevSessionRef = React.useRef(session);

  // Cuando la sesion pasa de algo a null (cierre de sesion),
  // resetear splashDone para que no quede en limbo
  React.useEffect(() => {
    if (prevSessionRef.current !== null && session === null && !loading) {
      // El usuario cerro sesion -> no mostrar splash, ir directo a Auth
      setSplashDone(true);
    }
    prevSessionRef.current = session;
  }, [session, loading]);

  // Mientras AuthContext inicializa, mostrar spinner
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#C9A84C" />
      </View>
    );
  }

  // Primera apertura de la app sin sesion -> mostrar splash
  if (!session && !splashDone) {
    return <SplashAnimatedScreen onFinish={() => setSplashDone(true)} />;
  }

  // Con o sin sesion, renderizar el navigator correcto
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
      <Stack.Screen
        name="AuthCallback"
        component={AuthCallbackScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <NavigationContainer linking={linking}>
            <RootNavigator />
          </NavigationContainer>
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D1A',
  },
});
