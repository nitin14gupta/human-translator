import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, TouchableOpacity, Switch, Image, Dimensions, Alert } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { LineChart } from "react-native-chart-kit";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define type for setting item
interface SettingItem {
  icon: string;
  title: string;
  description: string;
  action: "navigate" | "toggle";
  value?: boolean;
  setValue?: React.Dispatch<React.SetStateAction<boolean>>;
}

// Define type for user data
interface UserData {
  name: string;
  email: string;
  location: string;
  languages: string[];
  memberSince: string;
  completed_sessions: number;
  rating: number;
  reviews: number;
  biography: string;
  performance?: {
    earnings: number[];
    sessions: number[];
    months: string[];
  };
}

export default function TranslatorProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { logout } = useAuth();
  const [availableForWork, setAvailableForWork] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const screenWidth = Dimensions.get("window").width - 30;

  // Mock user data with added performance metrics
  const user: UserData = {
    name: "Sara Translator",
    email: "sara.translator@example.com",
    location: "Paris, France",
    languages: ["French", "English", "Spanish"],
    memberSince: "March 2023",
    completed_sessions: 48,
    rating: 4.8,
    reviews: 36,
    biography: "Professional translator with 5 years of experience in tourism and business settings. Specializing in French, English, and Spanish translations.",
    performance: {
      earnings: [500, 750, 900, 850, 1200, 1350],
      sessions: [5, 8, 10, 9, 12, 14],
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    }
  };

  // Settings sections
  const accountSettings: SettingItem[] = [
    { 
      icon: "person-outline", 
      title: "Edit Profile", 
      description: "Update your personal information and biography",
      action: "navigate"
    },
    { 
      icon: "language-outline", 
      title: "Language Proficiency", 
      description: "Manage languages you can translate",
      action: "navigate"
    },
    { 
      icon: "briefcase-outline", 
      title: "Available for Work", 
      description: "Appear in search results for travelers",
      action: "toggle",
      value: availableForWork,
      setValue: setAvailableForWork
    },
    { 
      icon: "cash-outline", 
      title: "Payment Settings", 
      description: "Manage your payment methods and preferences",
      action: "navigate"
    },
    { 
      icon: "notifications-outline", 
      title: "Notifications", 
      description: "Control push notifications",
      action: "toggle",
      value: notificationsEnabled,
      setValue: setNotificationsEnabled
    },
    { 
      icon: "location-outline", 
      title: "Location Services", 
      description: "Allow location access for finding nearby clients",
      action: "toggle",
      value: locationEnabled,
      setValue: setLocationEnabled
    }
  ];

  const supportSettings: SettingItem[] = [
    { 
      icon: "help-circle-outline", 
      title: "Help Center", 
      description: "Get help with using the app",
      action: "navigate"
    },
    { 
      icon: "chatbubble-ellipses-outline", 
      title: "Contact Support", 
      description: "Reach out to our team",
      action: "navigate"
    },
    { 
      icon: "star-outline", 
      title: "Rate the App", 
      description: "Share your feedback",
      action: "navigate"
    }
  ];

  // Render settings item
  const renderSettingItem = (item: SettingItem, index: number, isLast: boolean) => (
    <TouchableOpacity 
      key={index} 
      className={`flex-row items-center p-4 ${isLast ? '' : 'border-b border-neutral-gray-200'}`}
      disabled={item.action === "toggle"}
    >
      <View className="w-10 h-10 rounded-full bg-primary bg-opacity-10 justify-center items-center mr-4">
        <Ionicons name={item.icon as any} size={24} color="#007BFF" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-neutral-gray-800">{item.title}</Text>
        <Text className="text-sm text-neutral-gray-600">{item.description}</Text>
      </View>
      {item.action === "navigate" && (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      )}
      {item.action === "toggle" && (
        <Switch
          value={item.value}
          onValueChange={item.setValue}
          trackColor={{ false: "#ddd", true: "#bbd6ff" }}
          thumbColor={item.value ? "#007BFF" : "#f4f3f4"}
        />
      )}
    </TouchableOpacity>
  );

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
    priceScale: 0,
    lifeStyle: {
      borderRadius: 16
    }
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      t('profile.logoutConfirmTitle'),
      t('profile.logoutConfirmMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              
              // Try to logout from server
              try {
                await logout();
              } catch (error) {
                console.error('Server logout error:', error);
                // Continue with local logout even if server logout fails
              }

              // Clear all local storage data
              await AsyncStorage.multiRemove([
                'authToken',
                'refreshToken',
                'user',
                'needsProfileSetup'
              ]);

              // Force navigation to login
              router.replace('/login');
            } catch (error) {
              console.error('Local logout error:', error);
              Alert.alert(
                t('profile.logoutErrorTitle'),
                t('profile.logoutErrorMessage'),
                [{ text: t('common.ok') }]
              );
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-neutral-gray-100">
      <StatusBar style="light" />
      
      {/* Profile Header Section */}
      <View className="bg-primary pt-16 pb-8 items-center">
        <View className="relative mb-4">
          <View className="w-24 h-24 rounded-full bg-white justify-center items-center border-2 border-white">
            <Text className="text-4xl font-bold text-primary">{user.name[0]}</Text>
          </View>
          <TouchableOpacity className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full justify-center items-center border-2 border-white">
            <Ionicons name="camera" size={16} color="white" />
          </TouchableOpacity>
        </View>
        <Text className="text-2xl font-bold text-white mb-1">{user.name}</Text>
        <Text className="text-base text-white opacity-80 mb-2">{user.email}</Text>
        <Text className="text-sm text-white opacity-80 mb-2">
          <Ionicons name="location-outline" size={16} color="white" /> {user.location}
        </Text>
        <View className="flex-row items-center mb-2">
          <Text className="text-base font-bold text-white mr-1">{user.rating}</Text>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text className="text-sm text-white opacity-80 ml-1">({user.reviews} reviews)</Text>
        </View>
        <View className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
          <Text className="text-sm text-white font-medium">
            {availableForWork ? "Available for Work" : "Not Available"}
          </Text>
        </View>
      </View>

      {/* Stats Section */}
      <View className="flex-row bg-white mx-4 mt-[-20] rounded-xl shadow-sm p-4 mb-6">
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-neutral-gray-800">{user.completed_sessions}</Text>
          <Text className="text-xs text-neutral-gray-600">Sessions</Text>
        </View>
        <View className="w-[1px] h-[80%] bg-neutral-gray-200" />
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-neutral-gray-800">{user.languages.length}</Text>
          <Text className="text-xs text-neutral-gray-600">Languages</Text>
        </View>
        <View className="w-[1px] h-[80%] bg-neutral-gray-200" />
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-neutral-gray-800">{user.memberSince}</Text>
          <Text className="text-xs text-neutral-gray-600">Member Since</Text>
        </View>
      </View>

      {/* Biography Section */}
      <View className="bg-white mx-4 rounded-xl shadow-sm p-4 mb-6">
        <Text className="text-lg font-medium text-neutral-gray-800 mb-2">Biography</Text>
        <Text className="text-sm text-neutral-gray-600 leading-5 mb-2">{user.biography}</Text>
        <TouchableOpacity className="self-end">
          <Text className="text-sm text-primary font-medium">Edit Biography</Text>
        </TouchableOpacity>
      </View>

      {/* Languages Section */}
      <View className="mb-6">
        <Text className="text-lg font-medium text-neutral-gray-800 mx-4 mb-2">Languages</Text>
        <View className="bg-white mx-4 rounded-xl shadow-sm p-4">
          {user.languages.map((language, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <MaterialIcons name="translate" size={20} color="#007BFF" />
              <Text className="text-base text-neutral-gray-800 ml-3">{language}</Text>
            </View>
          ))}
          <TouchableOpacity className="flex-row items-center mt-2">
            <Ionicons name="add" size={20} color="#007BFF" />
            <Text className="text-sm text-primary font-medium ml-2">Add Language</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Performance Chart Section - NEW */}
      <View className="mb-6">
        <Text className="text-lg font-medium text-neutral-gray-800 mx-4 mb-2">Performance</Text>
        <View className="bg-white mx-4 rounded-xl shadow-sm p-4">
          <Text className="text-base font-medium text-neutral-gray-800 mb-2">Earnings Overview</Text>
          <LineChart
            data={{
              labels: user.performance?.months || [],
              datasets: [
                {
                  data: user.performance?.earnings || [],
                  color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
                  strokeWidth: 2
                }
              ]
            }}
            width={screenWidth - 40}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
          
          <Text className="text-base font-medium text-neutral-gray-800 mt-4 mb-2">Sessions Completed</Text>
          <LineChart
            data={{
              labels: user.performance?.months || [],
              datasets: [
                {
                  data: user.performance?.sessions || [],
                  color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
                  strokeWidth: 2
                }
              ]
            }}
            width={screenWidth - 40}
            height={180}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </View>
      </View>

      {/* Account Settings */}
      <View className="mb-6">
        <Text className="text-lg font-medium text-neutral-gray-800 mx-4 mb-2">Account Settings</Text>
        <View className="bg-white mx-4 rounded-xl shadow-sm overflow-hidden">
          {accountSettings.map((item, index) => 
            renderSettingItem(item, index, index === accountSettings.length - 1)
          )}
        </View>
      </View>

      {/* Support & Help */}
      <View className="mb-6">
        <Text className="text-lg font-medium text-neutral-gray-800 mx-4 mb-2">Support & Help</Text>
        <View className="bg-white mx-4 rounded-xl shadow-sm overflow-hidden">
          {supportSettings.map((item, index) => 
            renderSettingItem(item, index, index === supportSettings.length - 1)
          )}
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        className="flex-row items-center justify-center bg-[#FFE5E5] mx-4 mb-4 mt-2 rounded-xl p-4"
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
        <Text className="text-[#FF3B30] text-base font-medium ml-2">
          {isLoggingOut ? t('profile.loggingOut') : t('profile.logout')}
        </Text>
      </TouchableOpacity>

      {/* App Version */}
      <Text className="text-center text-neutral-gray-500 text-xs mb-8">Version 1.0.0</Text>
    </ScrollView>
  );
} 