import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../services/api";
import CircularProgress from "../../../components/CircularProgress";
import { LinearGradient } from "expo-linear-gradient";

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
    name: "",
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

      setLoading(true);
      const response = await apiFetch<TravelerProfile>(`/api/profiles/traveler/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      setProfileData(response);
      setIsEditing(false);
      setLoading(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
      setLoading(false);
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

  const getInitials = (name: string) => {
    return name
      ? name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
      : "?";
  };

  const getProfileCompletionColor = () => {
    if (profileData.profile_completion < 30) return "#ef4444"; // red
    if (profileData.profile_completion < 70) return "#f59e0b"; // amber
    return "#10b981"; // green
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text className="text-gray-600 mt-4">Loading profile...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Profile Header with Gradient */}
      <LinearGradient
        colors={["#6366f1", "#4f46e5"]}
        className="pt-12 pb-20 px-4"
      >
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-white">My Profile</Text>
          <TouchableOpacity
            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
            className="bg-white/20 px-4 py-1 rounded-full"
          >
            <Text className="text-white font-medium">
              {isEditing ? "Save" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 -mt-16">
        {/* Profile Photo & Completion Card */}
        <View className="bg-white mx-4 rounded-xl shadow-sm p-4">
          <View className="flex-row">
            <View className="relative">
              {profileData.photo_url ? (
                <Image
                  source={{ uri: profileData.photo_url }}
                  className="w-24 h-24 rounded-full border-4 border-white"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-indigo-100 items-center justify-center border-4 border-white">
                  <Text className="text-indigo-800 text-2xl font-bold">
                    {getInitials(user?.name || "")}
                  </Text>
                </View>
              )}
              {isEditing && (
                <TouchableOpacity
                  className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 border-2 border-white"
                  onPress={() => Alert.alert("Change Photo", "Photo upload not implemented")}
                >
                  <Ionicons name="camera" size={16} color="white" />
                </TouchableOpacity>
              )}
            </View>

            <View className="ml-4 flex-1 justify-center">
              <Text className="text-xl font-semibold text-gray-900">
                {user?.name || "Your Name"}
              </Text>
              <Text className="text-gray-600">
                Traveler
              </Text>
            </View>

            <View className="ml-2">
              <CircularProgress
                percentage={profileData.profile_completion}
                radius={25}
                strokeWidth={5}
                color={getProfileCompletionColor()}
              />
              <Text className="text-center text-xs mt-1 font-medium" style={{ color: getProfileCompletionColor() }}>
                {profileData.profile_completion}%
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Info */}
        <View className="bg-white mx-4 mt-4 rounded-xl shadow-sm">
          <View className="flex-row justify-between divide-x divide-gray-100">
            <View className="flex-1 py-4 items-center">
              <Text className="text-indigo-600 text-lg font-bold">{profileData.nationality || "-"}</Text>
              <Text className="text-gray-500 text-xs">Nationality</Text>
            </View>
            <View className="flex-1 py-4 items-center">
              <Text className="text-indigo-600 text-lg font-bold">{profileData.languages_needed.length}</Text>
              <Text className="text-gray-500 text-xs">Languages</Text>
            </View>
            <View className="flex-1 py-4 items-center">
              <Text className="text-indigo-600 text-lg font-bold">{profileData.interests.length}</Text>
              <Text className="text-gray-500 text-xs">Interests</Text>
            </View>
          </View>
        </View>

        {/* Bio Section */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="person-outline" size={20} color="#6366f1" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Bio</Text>
          </View>

          {isEditing ? (
            <TextInput
              value={profileData.bio}
              onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
              className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[100]"
              multiline
              placeholder="Tell us about yourself, your travel interests, and what you're looking for in a translator..."
            />
          ) : (
            <Text className="text-gray-600 leading-5">
              {profileData.bio || "No bio added yet. Add a bio to introduce yourself and share your travel plans."}
            </Text>
          )}
        </View>

        {/* Current Location */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="location-on" size={20} color="#6366f1" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Current Location</Text>
          </View>

          {isEditing ? (
            <TextInput
              value={profileData.current_location}
              onChangeText={(text) => setProfileData({ ...profileData, current_location: text })}
              className="text-gray-600 bg-gray-50 p-3 rounded-lg"
              placeholder="Where are you currently located?"
            />
          ) : (
            <Text className="text-gray-600">
              {profileData.current_location || "No location specified"}
            </Text>
          )}
        </View>

        {/* Nationality */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="passport" size={20} color="#6366f1" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Nationality</Text>
          </View>

          {isEditing ? (
            <TextInput
              value={profileData.nationality}
              onChangeText={(text) => setProfileData({ ...profileData, nationality: text })}
              className="text-gray-600 bg-gray-50 p-3 rounded-lg"
              placeholder="Your nationality"
            />
          ) : (
            <Text className="text-gray-600">
              {profileData.nationality || "Not specified"}
            </Text>
          )}
        </View>

        {/* Languages Needed */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="translate" size={20} color="#6366f1" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Languages I Need Help With</Text>
          </View>

          {profileData.languages_needed.length > 0 ? (
            <View className="divide-y divide-gray-100">
              {profileData.languages_needed.map((language, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between py-3"
                >
                  <Text className="text-gray-900 font-medium">{language.language_name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-gray-500 italic">No languages added yet</Text>
          )}

          {isEditing && (
            <TouchableOpacity
              className="mt-3 flex-row items-center bg-indigo-50 p-2 rounded-lg"
              onPress={() => Alert.alert("Add Language", "Language selection not implemented")}
            >
              <Ionicons name="add-circle-outline" size={20} color="#6366f1" />
              <Text className="text-indigo-600 ml-1 font-medium">Add Language</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Interests */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="interests" size={20} color="#6366f1" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Interests</Text>
          </View>

          {profileData.interests.length > 0 ? (
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
          ) : (
            <Text className="text-gray-500 italic">No interests added yet</Text>
          )}

          {isEditing && (
            <TouchableOpacity
              className="mt-3 flex-row items-center bg-indigo-50 p-2 rounded-lg"
              onPress={() => Alert.alert("Add Interest", "Interest selection not implemented")}
            >
              <Ionicons name="add-circle-outline" size={20} color="#6366f1" />
              <Text className="text-indigo-600 ml-1 font-medium">Add Interest</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Travel Preferences */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="airplane" size={20} color="#6366f1" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Travel Preferences</Text>
          </View>

          {isEditing ? (
            <View className="space-y-4">
              <View className="bg-gray-50 rounded-lg p-3">
                <Text className="text-gray-600 mb-1 text-xs">Preferred Language</Text>
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
                  placeholder="e.g., English, Spanish"
                />
              </View>

              <View className="bg-gray-50 rounded-lg p-3">
                <Text className="text-gray-600 mb-1 text-xs">Preferred Currency</Text>
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
                  placeholder="e.g., EUR, USD"
                />
              </View>
            </View>
          ) : (
            <View className="divide-y divide-gray-100">
              <View className="py-2">
                <Text className="text-gray-600 text-xs">Preferred Language</Text>
                <Text className="text-gray-900">{profileData.travel_preferences.preferred_language || "Not set"}</Text>
              </View>
              <View className="py-2">
                <Text className="text-gray-600 text-xs">Preferred Currency</Text>
                <Text className="text-gray-900">{profileData.travel_preferences.preferred_currency || "Not set"}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Emergency Contact */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="emergency" size={20} color="#6366f1" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Emergency Contact</Text>
          </View>

          {isEditing ? (
            <View className="space-y-4">
              <View className="bg-gray-50 rounded-lg p-3">
                <Text className="text-gray-600 mb-1 text-xs">Name</Text>
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
                  placeholder="Contact person's name"
                />
              </View>

              <View className="bg-gray-50 rounded-lg p-3">
                <Text className="text-gray-600 mb-1 text-xs">Relationship</Text>
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
                  placeholder="e.g., Parent, Spouse, Friend"
                />
              </View>

              <View className="bg-gray-50 rounded-lg p-3">
                <Text className="text-gray-600 mb-1 text-xs">Phone</Text>
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
                  placeholder="Contact phone number"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          ) : (
            <View className="divide-y divide-gray-100">
              {profileData.emergency_contact.name ? (
                <>
                  <View className="py-2">
                    <Text className="text-gray-900 font-medium">
                      {profileData.emergency_contact.name}
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      {profileData.emergency_contact.relationship}
                    </Text>
                  </View>
                  <View className="py-2">
                    <Text className="text-gray-600 text-xs">Phone</Text>
                    <Text className="text-gray-900">{profileData.emergency_contact.phone}</Text>
                  </View>
                </>
              ) : (
                <Text className="text-gray-500 italic">No emergency contact added yet</Text>
              )}
            </View>
          )}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          className="bg-red-50 mx-4 mt-6 mb-8 py-3 rounded-xl"
          onPress={handleSignOut}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text className="text-red-600 font-medium ml-2">Sign Out</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
