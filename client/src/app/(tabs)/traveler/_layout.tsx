import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

export default function TravelerTabLayout() {
  const { t } = useTranslation();
  
  return (
    <Tabs 
      screenOptions={{
        tabBarActiveTintColor: '#0066CC',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          borderTopWidth: 0,
          paddingTop: 5,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          height: Platform.OS === 'ios' ? 80 : 65,
          backgroundColor: '#FFFFFF',
        },
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 11,
          marginBottom: 5,
        },
        tabBarItemStyle: {
          padding: 5,
        },
        headerStyle: {
          backgroundColor: '#0066CC',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          headerTitle: t('home.greeting'),
        }} 
      />
      <Tabs.Screen 
        name="chat" 
        options={{
          title: t('tabs.chat'),
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />,
          // Uncomment and set a number when there are unread messages
          // tabBarBadge: 3,
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
} 