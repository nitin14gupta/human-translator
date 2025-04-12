import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { getLanguage } from '../services/languageService';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, getUserType, user } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        console.log('Auth state:', { isAuthenticated, authLoading, user });
        setIsNavigating(true);
        
        // Check for auth token directly - this is the most reliable indicator of authentication
        const authToken = await AsyncStorage.getItem('authToken');
        const userType = await getUserType(); // This should work even without a fully loaded user object
        
        console.log('Token existence check:', { hasToken: !!authToken, userType });
        
        // If we have a token, we're authenticated regardless of user object status
        if (authToken) {
          console.log('Auth token found, redirecting to appropriate tab');
          
          if (userType === 'traveler') {
            console.log('User is a traveler, redirecting to traveler tabs');
            router.replace('/(tabs)/traveler');
          } else {
            console.log('User is a translator, redirecting to translator tabs');
            router.replace('/(tabs)/translator');
          }
          return;
        }
        
        // Fall back to normal auth check (for cases where token might be missing but user is loaded)
        if (isAuthenticated && user) {
          console.log('Using user object authentication, redirecting to appropriate tab');
          if (userType === 'traveler') {
            router.replace('/(tabs)/traveler');
          } else {
            router.replace('/(tabs)/translator');
          }
          return;
        }
        
        // Check if user has selected language before
        const currentLanguage = await getLanguage();
        console.log('Current language:', currentLanguage);
        
        // If language is already set but not logged in, go to role selection
        if (currentLanguage) {
          console.log('Language set but not logged in, redirecting to role selection');
          router.replace('/roleSelection');
        } 
        // If first time or language not set, go to language selection
        else {
          console.log('First time or language not set, redirecting to language selection');
          router.replace('/languageSelection');
        }
      } catch (error) {
        console.error('Error determining initial route:', error);
        // Default to language selection on error
        router.replace('/languageSelection');
      } finally {
        setIsNavigating(false);
      }
    };

    if (!authLoading) {
      checkInitialRoute();
    }
  }, [router, isAuthenticated, authLoading, user]);

  // Show loading indicator while determining route
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0066CC" />
      <Text style={{ marginTop: 10 }}>
        {authLoading ? 'Loading user data...' : 'Navigating...'}
      </Text>
    </View>
  );
}