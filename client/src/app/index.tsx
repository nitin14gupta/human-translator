import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getLanguage } from '../services/languageService';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, getUserType } = useAuth();

  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        // Check if user has selected language before
        const currentLanguage = await getLanguage();
        
        // If user is authenticated, navigate to the appropriate tab
        if (isAuthenticated) {
          const userType = await getUserType();
          if (userType === 'traveler') {
            router.replace('/(tabs)/traveler');
          } else {
            router.replace('/(tabs)/translator');
          }
        } 
        // If language is already set but not logged in, go to role selection
        else if (currentLanguage) {
          router.replace('/roleSelection');
        } 
        // If first time or language not set, go to language selection
        else {
          router.replace('/languageSelection');
        }
      } catch (error) {
        console.error('Error determining initial route:', error);
        // Default to language selection on error
        router.replace('/languageSelection');
      }
    };

    if (!authLoading) {
      checkInitialRoute();
    }
  }, [router, isAuthenticated, authLoading]);

  // Show loading indicator while determining route
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0066CC" />
    </View>
  );
}
