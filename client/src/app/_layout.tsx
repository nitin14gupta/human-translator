import { useEffect } from 'react';
import { Stack } from 'expo-router';
import '../i18n'; // Import i18n configuration
import { loadSavedLanguage } from '../services/languageService';
import '@/global.css';

export default function Layout() {
  // Load saved language when app starts
  useEffect(() => {
    const initLanguage = async () => {
      await loadSavedLanguage();
    };
    
    initLanguage();
  }, []);

  return (
    <Stack initialRouteName="index">
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(shared)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

