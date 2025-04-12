import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import '../i18n';
import { loadSavedLanguage } from '../i18n';
import '@/global.css';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  // Load saved language on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load saved language from storage
        await loadSavedLanguage();
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    
    initializeApp();
  }, []);

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="languageSelection" options={{ headerShown: false }} />
        <Stack.Screen name="roleSelection" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="forgotPassword" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}

