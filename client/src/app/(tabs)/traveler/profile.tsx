import React, { useState, useEffect } from "react";
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
import { apiFetch } from "../../../services/api";
import CircularProgress from "../../../components/CircularProgress";

interface Language {
  language_code: string;
  language_name: string;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

interface TravelerProfile {
  id: number;
  user_id: number;
  photo_url: string;
  bio: string;
  nationality: string;
  languages_needed: Language[];
  current_location: string;
  travel_preferences: {
    preferred_language: string;
    preferred_currency: string;
    accommodation_type?: string;
    travel_style?: string[];
  };
  interests: string[];
  emergency_contact: EmergencyContact;
  profile_completion: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<TravelerProfile>({
    id: 0,
    user_id: 0,
    photo_url: "",
    bio: "",
    nationality: "",
    languages_needed: [],
    current_location: "",
    travel_preferences: {
      preferred_language: "en",
      preferred_currency: "EUR",
    },
    interests: [],
    emergency_contact: {
      name: "",
      relationship: "",
      phone: "",
    },
    profile_completion: 0,
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?.id) {
          const response = await apiFetch<TravelerProfile>(`/api/profiles/traveler/${user.id}`);
          setProfileData(response);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    try {
      if (!user?.id) {
        Alert.alert('Error', 'User ID not found');
        return;
      }

      const response = await apiFetch<TravelerProfile>(`/api/profiles/traveler/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      setProfileData(response);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
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

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

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
        {/* Profile Completion */}
        <View className="bg-white p-4 mb-4">
          <View className="items-center">
            <CircularProgress 
              percentage={profileData.profile_completion} 
              radius={40} 
              strokeWidth={10} 
            />
            <Text className="mt-2 text-gray-600">
              Profile Completion: {profileData.profile_completion}%
            </Text>
          </View>
        </View>

        {/* Profile Photo Section */}
        <View className="bg-white p-4 items-center border-b border-gray-200">
          <View className="relative">
            <Image
              source={{ uri: profileData.photo_url || "https://placekitten.com/200/200" }}
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
        </View>

        {/* Bio Section */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Bio</Text>
          {isEditing ? (
            <TextInput
              value={profileData.bio}
              onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
              className="text-gray-600 min-h-[100]"
              multiline
              placeholder="Tell us about yourself..."
            />
          ) : (
            <Text className="text-gray-600">{profileData.bio || "No bio added yet"}</Text>
          )}
        </View>

        {/* Nationality Section */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Nationality</Text>
          {isEditing ? (
            <TextInput
              value={profileData.nationality}
              onChangeText={(text) => setProfileData({ ...profileData, nationality: text })}
              className="text-gray-900"
              placeholder="Your nationality"
            />
          ) : (
            <Text className="text-gray-900">{profileData.nationality || "Not specified"}</Text>
          )}
        </View>

        {/* Current Location */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Current Location</Text>
          {isEditing ? (
            <TextInput
              value={profileData.current_location}
              onChangeText={(text) => setProfileData({ ...profileData, current_location: text })}
              className="text-gray-900"
              placeholder="Where are you now?"
            />
          ) : (
            <Text className="text-gray-900">{profileData.current_location || "Not specified"}</Text>
          )}
        </View>

        {/* Languages Needed */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Languages I Need Help With</Text>
          {profileData.languages_needed.map((language, index) => (
            <View 
              key={index}
              className="flex-row items-center justify-between py-2"
            >
              <Text className="text-gray-900">{language.language_name}</Text>
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

        {/* Interests */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Interests</Text>
          <View className="flex-row flex-wrap">
            {profileData.interests.map((interest, index) => (
              <View 
                key={index}
                className="bg-gray-100 rounded-full px-3 py-1 m-1"
              >
                <Text className="text-gray-800">{interest}</Text>
              </View>
            ))}
          </View>
          {isEditing && (
            <TouchableOpacity 
              className="mt-2 flex-row items-center"
              onPress={() => Alert.alert("Add Interest", "Interest selection not implemented")}
            >
              <Ionicons name="add-circle-outline" size={20} color="#1a73e8" />
              <Text className="text-blue-600 ml-1">Add Interest</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Travel Preferences */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Travel Preferences</Text>
          {isEditing ? (
            <>
              <View className="mb-4">
                <Text className="text-gray-600 mb-1">Preferred Language</Text>
                <TextInput
                  value={profileData.travel_preferences.preferred_language}
                  onChangeText={(text) => setProfileData({
                    ...profileData,
                    travel_preferences: {
                      ...profileData.travel_preferences,
                      preferred_language: text
                    }
                  })}
                  className="text-gray-900"
                />
              </View>
              <View>
                <Text className="text-gray-600 mb-1">Preferred Currency</Text>
                <TextInput
                  value={profileData.travel_preferences.preferred_currency}
                  onChangeText={(text) => setProfileData({
                    ...profileData,
                    travel_preferences: {
                      ...profileData.travel_preferences,
                      preferred_currency: text
                    }
                  })}
                  className="text-gray-900"
                />
              </View>
            </>
          ) : (
            <>
              <Text className="text-gray-900">
                Language: {profileData.travel_preferences.preferred_language}
              </Text>
              <Text className="text-gray-900 mt-2">
                Currency: {profileData.travel_preferences.preferred_currency}
              </Text>
            </>
          )}
        </View>

        {/* Emergency Contact */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Emergency Contact</Text>
          {isEditing ? (
            <>
              <View className="mb-4">
                <Text className="text-gray-600 mb-1">Name</Text>
                <TextInput
                  value={profileData.emergency_contact.name}
                  onChangeText={(text) => setProfileData({
                    ...profileData,
                    emergency_contact: {
                      ...profileData.emergency_contact,
                      name: text
                    }
                  })}
                  className="text-gray-900"
                />
              </View>
              <View className="mb-4">
                <Text className="text-gray-600 mb-1">Relationship</Text>
                <TextInput
                  value={profileData.emergency_contact.relationship}
                  onChangeText={(text) => setProfileData({
                    ...profileData,
                    emergency_contact: {
                      ...profileData.emergency_contact,
                      relationship: text
                    }
                  })}
                  className="text-gray-900"
                />
              </View>
              <View>
                <Text className="text-gray-600 mb-1">Phone</Text>
                <TextInput
                  value={profileData.emergency_contact.phone}
                  onChangeText={(text) => setProfileData({
                    ...profileData,
                    emergency_contact: {
                      ...profileData.emergency_contact,
                      phone: text
                    }
                  })}
                  className="text-gray-900"
                  keyboardType="phone-pad"
                />
              </View>
            </>
          ) : (
            <>
              <Text className="text-gray-900">
                {profileData.emergency_contact.name} ({profileData.emergency_contact.relationship})
              </Text>
              <Text className="text-gray-900 mt-2">
                {profileData.emergency_contact.phone}
              </Text>
            </>
          )}
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
