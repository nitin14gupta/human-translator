import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../../context/AuthContext";

interface Language {
  code: string;
  name: string;
  level: "native" | "fluent" | "intermediate" | "basic";
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 234 567 8900",
    languages: [
      { code: "en", name: "English", level: "native" },
      { code: "fr", name: "French", level: "basic" },
    ] as Language[],
    notifications: {
      bookingUpdates: true,
      messages: true,
      promotions: false,
      newsletter: false,
    },
    preferences: {
      darkMode: false,
      autoTranslate: true,
    },
  });

  const handleSave = () => {
    // Validate data
    if (!profileData.name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    // Save changes
    setIsEditing(false);
    Alert.alert("Success", "Profile updated successfully");
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-900">Profile</Text>
          <TouchableOpacity
            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            <Text className="text-blue-600 font-medium">
              {isEditing ? "Save" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Photo Section */}
        <View className="bg-white p-4 items-center border-b border-gray-200">
          <View className="relative">
            <Image
              source={{ uri: "https://placekitten.com/200/200" }}
              className="w-24 h-24 rounded-full"
            />
            {isEditing && (
              <TouchableOpacity 
                className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2"
                onPress={() => Alert.alert("Change Photo", "Photo upload not implemented")}
              >
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            )}
          </View>
          
          {isEditing ? (
            <TextInput
              value={profileData.name}
              onChangeText={(text) => setProfileData({ ...profileData, name: text })}
              className="text-xl font-semibold text-gray-900 mt-4 text-center"
              placeholder="Your Name"
            />
          ) : (
            <Text className="text-xl font-semibold text-gray-900 mt-4">
              {profileData.name}
            </Text>
          )}
        </View>

        {/* Contact Information */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Contact Information</Text>
          
          <View className="mb-4">
            <Text className="text-gray-600 mb-1">Email</Text>
            {isEditing ? (
              <TextInput
                value={profileData.email}
                onChangeText={(text) => setProfileData({ ...profileData, email: text })}
                className="text-gray-900"
                keyboardType="email-address"
              />
            ) : (
              <Text className="text-gray-900">{profileData.email}</Text>
            )}
          </View>

          <View>
            <Text className="text-gray-600 mb-1">Phone</Text>
            {isEditing ? (
              <TextInput
                value={profileData.phone}
                onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
                className="text-gray-900"
                keyboardType="phone-pad"
              />
            ) : (
              <Text className="text-gray-900">{profileData.phone}</Text>
            )}
          </View>
        </View>

        {/* Languages Section */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Languages I Speak</Text>
          {profileData.languages.map((language) => (
            <View 
              key={language.code}
              className="flex-row items-center justify-between py-2"
            >
              <View className="flex-row items-center">
                <Text className="text-gray-900">{language.name}</Text>
                {language.level === "native" && (
                  <View className="bg-blue-100 rounded-full px-2 py-1 ml-2">
                    <Text className="text-blue-600 text-xs">Native</Text>
                  </View>
                )}
              </View>
              <Text className="text-gray-600 capitalize">{language.level}</Text>
            </View>
          ))}
          {isEditing && (
            <TouchableOpacity 
              className="mt-2 flex-row items-center"
              onPress={() => Alert.alert("Add Language", "Language selection not implemented")}
            >
              <Ionicons name="add-circle-outline" size={20} color="#1a73e8" />
              <Text className="text-blue-600 ml-1">Add Language</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications Section */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Notifications</Text>
          {Object.entries(profileData.notifications).map(([key, value]) => (
            <View 
              key={key}
              className="flex-row items-center justify-between py-2"
            >
              <Text className="text-gray-900 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </Text>
              <Switch
                value={value}
                onValueChange={(newValue) => 
                  setProfileData({
                    ...profileData,
                    notifications: {
                      ...profileData.notifications,
                      [key]: newValue,
                    },
                  })
                }
                disabled={!isEditing}
              />
            </View>
          ))}
        </View>

        {/* Preferences Section */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Preferences</Text>
          {Object.entries(profileData.preferences).map(([key, value]) => (
            <View 
              key={key}
              className="flex-row items-center justify-between py-2"
            >
              <Text className="text-gray-900 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </Text>
              <Switch
                value={value}
                onValueChange={(newValue) => 
                  setProfileData({
                    ...profileData,
                    preferences: {
                      ...profileData.preferences,
                      [key]: newValue,
                    },
                  })
                }
                disabled={!isEditing}
              />
            </View>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          className="bg-red-50 mx-4 mt-6 mb-8 py-3 rounded-full"
          onPress={handleSignOut}
        >
          <Text className="text-red-600 text-center font-medium">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
