import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import '../i18n'; // Import i18n configuration
import { loadSavedLanguage } from '../services/languageService';
import '@/global.css';
import FallbackHandler from '@/src/components/FallbackHandler';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Root component that wraps the app with auth provider
export default function RootLayout() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}

// Layout component that handles initialization
function Layout() {
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);
  const { isLoading } = useAuth();

  // Load saved language when app starts
  useEffect(() => {
    const initLanguage = async () => {
      try {
        await loadSavedLanguage();
        setIsLanguageLoaded(true);
      } catch (error) {
        console.error('Error loading language:', error);
        setIsLanguageLoaded(true); // Continue anyway with default language
      }
    };

    initLanguage();
  }, []);

  // Show loading if auth or language is still initializing
  if (isLoading || !isLanguageLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={{ marginTop: 10 }}>
          {isLoading ? 'Loading user data...' : 'Loading language preferences...'}
        </Text>
      </View>
    );
  }

  return (
    <FallbackHandler>
      <Stack initialRouteName="index">
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(shared)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(traveler)" options={{ headerShown: false }} />
        <Stack.Screen name="(translator)" options={{ headerShown: false }} />
        <Stack.Screen name='fallbacks' options={{ headerShown: false }} />
      </Stack>
    </FallbackHandler>
  );
}

