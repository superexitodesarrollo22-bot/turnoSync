import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

function RootNavigator() {
  const { user, profile, loading } = useAuth();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 Estado de App:');
  console.log('   Loading:', loading);
  console.log('   User:', user ? `✅ ${user.email}` : '❌ No user');
  console.log('   Profile:', profile ? `✅ ${profile.email}` : '❌ No profile');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Estado 1: Cargando autenticación inicial
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.text}>Cargando TurnoSync...</Text>
      </View>
    );
  }

  // Estado 2: Usuario autenticado pero esperando perfil
  if (user && !profile) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.text}>Configurando tu perfil...</Text>
        <Text style={styles.subtext}>Solo un momento</Text>
      </View>
    );
  }

  // Estado 3: Decidir navegación
  const shouldShowApp = user && profile;

  console.log('🧭 Navegando a:', shouldShowApp ? 'AppNavigator' : 'AuthNavigator');

  return shouldShowApp ? <AppNavigator /> : <AuthNavigator />;
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D1A', // Usamos el color oscuro del tema
  },
  text: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#A0A0A0',
  },
});
