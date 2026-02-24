import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';

import { View, ActivityIndicator, Text } from 'react-native';

function RootNavigator() {
  const { session, profile, loading } = useAuth();

  console.log('RootNavigator State:', { hasSession: !!session, hasProfile: !!profile, loading });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D1A' }}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  // Si hay sesión pero el perfil aún no carga (aunque loading sea false, por si el retry falló)
  if (session && !profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D1A' }}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={{ marginTop: 20, color: '#FFFFFF', fontSize: 16 }}>Configurando tu perfil...</Text>
      </View>
    );
  }

  return session ? <AppNavigator /> : <AuthNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
