import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import AuthCallbackScreen from './src/screens/Auth/AuthCallbackScreen';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [
    'turnosync://', // Producción
    'exp://', // Desarrollo
    Linking.createURL('/'), // Expo Go dynamic
  ],
  config: {
    screens: {
      AuthCallback: 'auth/callback',
    },
  },
};

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

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user && profile ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
      {/* Pantalla de callback siempre accesible por deep linking */}
      <Stack.Group screenOptions={{ presentation: 'transparentModal', headerShown: false }}>
        <Stack.Screen name="AuthCallback" component={AuthCallbackScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer linking={linking}>
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
    backgroundColor: '#0D0D1A',
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
