import { useEffect, useState } from 'react';
import { Tabs } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();
  const [isNeedTranslator, setIsNeedTranslator] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user role from AsyncStorage
    const getUserRole = async () => {
      try {
        const roleValue = await AsyncStorage.getItem('isNeedTranslator');
        setIsNeedTranslator(roleValue === 'true');
      } catch (error) {
        console.error('Error retrieving user role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getUserRole();
  }, []);

  // While loading, return a minimal tab layout
  if (isLoading) {
    return (
      <Tabs>
        <Tabs.Screen name="index" options={{ headerShown: false }} />
      </Tabs>
    );
  }

  // Different tabs based on user role
  if (isNeedTranslator) {
    // Tabs for users who need translators (travelers)
    return (
      <Tabs screenOptions={{ tabBarActiveTintColor: '#007BFF' }}>
        <Tabs.Screen 
          name="index" 
          options={{
            title: t('tabs.home'),
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }} 
        />
        <Tabs.Screen 
          name="chat" 
          options={{
            title: t('tabs.chat'),
            tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />,
          }} 
        />
        <Tabs.Screen 
          name="profile" 
          options={{
            title: t('tabs.profile'),
            tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
          }} 
        />
      </Tabs>
    );
  } else {
    // Tabs for users who offer translation services (translators)
    return (
      <Tabs screenOptions={{ tabBarActiveTintColor: '#007BFF' }}>
        <Tabs.Screen 
          name="index" 
          options={{
            title: t('tabs.home'),
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }} 
        />
        <Tabs.Screen 
          name="chat" 
          options={{
            title: t('tabs.chat'),
            tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />,
          }} 
        />
        <Tabs.Screen 
          name="profile" 
          options={{
            title: t('tabs.profile'),
            tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
          }} 
        />
        <Tabs.Screen 
          name="earnings" 
          options={{
            title: t('tabs.earnings'),
            tabBarIcon: ({ color, size }) => <Ionicons name="wallet" size={size} color={color} />,
          }} 
        />
      </Tabs>
    );
  }
}
