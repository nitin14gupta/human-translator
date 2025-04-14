import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  TextInput,
  Platform,
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
  proficiency_level: "native" | "fluent" | "intermediate";
}

interface Education {
  degree: string;
  institution: string;
  year: string;
}

interface Certificate {
  name: string;
  issuer: string;
  year: string;
  verified: boolean;
}

interface TranslatorProfile {
  id: string;
  name: string;
  languages: Language[];
  hourly_rate: number;
  photo_url: string;
  location: string;
  bio: string;
  is_available: boolean;
  education: Education[];
  certificates: Certificate[];
  specializations: string[];
  years_of_experience: number;
  social_media: Record<string, string>;
  preferred_meeting_locations: string[];
  availability_hours: Record<string, any>;
  profile_completion: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<TranslatorProfile>({
    id: "",
    name: "",
    languages: [],
    hourly_rate: 0,
    photo_url: "",
    location: "",
    bio: "",
    is_available: true,
    education: [],
    certificates: [],
    specializations: [],
    years_of_experience: 0,
    social_media: {},
    preferred_meeting_locations: [],
    availability_hours: {},
    profile_completion: 0,
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?.id) {
          const response = await apiFetch<TranslatorProfile>(`/api/profiles/translator/${user.id}`);
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

      const response = await apiFetch<TranslatorProfile>(`/api/profiles/translator/${user.id}`, {
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
          
          <Text className="text-xl font-semibold text-gray-900 mt-4">
            {profileData.name}
          </Text>
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
              placeholder="Tell travelers about yourself..."
            />
          ) : (
            <Text className="text-gray-600">{profileData.bio || "No bio added yet"}</Text>
          )}
        </View>

        {/* Rate Section */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Hourly Rate</Text>
          <View className="flex-row items-center">
            <Text className="text-gray-600 text-2xl">€</Text>
            {isEditing ? (
              <TextInput
                value={profileData.hourly_rate.toString()}
                onChangeText={(text) => setProfileData({ ...profileData, hourly_rate: parseFloat(text) || 0 })}
                className="text-gray-900 text-2xl ml-1"
                keyboardType="numeric"
              />
            ) : (
              <Text className="text-gray-900 text-2xl ml-1">
                {profileData.hourly_rate}
              </Text>
            )}
            <Text className="text-gray-600 ml-1">/hour</Text>
          </View>
        </View>

        {/* Languages Section */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Languages</Text>
          {profileData.languages.map((language, index) => (
            <View 
              key={index}
              className="flex-row items-center justify-between py-2"
            >
              <View className="flex-row items-center">
                <Text className="text-gray-900">{language.language_name}</Text>
                {language.proficiency_level === "native" && (
                  <View className="bg-blue-100 rounded-full px-2 py-1 ml-2">
                    <Text className="text-blue-600 text-xs">Native</Text>
                  </View>
                )}
              </View>
              <Text className="text-gray-600 capitalize">{language.proficiency_level}</Text>
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

        {/* Education Section */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Education</Text>
          {profileData.education.map((edu, index) => (
            <View 
              key={index}
              className="py-2"
            >
              <Text className="text-gray-900 font-medium">{edu.degree}</Text>
              <Text className="text-gray-600">{edu.institution}</Text>
              <Text className="text-gray-500 text-sm">{edu.year}</Text>
            </View>
          ))}
          {isEditing && (
            <TouchableOpacity 
              className="mt-2 flex-row items-center"
              onPress={() => Alert.alert("Add Education", "Education form not implemented")}
            >
              <Ionicons name="add-circle-outline" size={20} color="#1a73e8" />
              <Text className="text-blue-600 ml-1">Add Education</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Certificates Section */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Certificates</Text>
          {profileData.certificates.map((cert, index) => (
            <View 
              key={index}
              className="flex-row items-center justify-between py-2"
            >
              <View>
                <Text className="text-gray-900">{cert.name}</Text>
                <Text className="text-gray-600 text-sm">
                  {cert.issuer} • {cert.year}
                </Text>
              </View>
              {cert.verified && (
                <View className="bg-green-100 rounded-full px-2 py-1">
                  <Text className="text-green-600 text-xs">Verified</Text>
                </View>
              )}
            </View>
          ))}
          {isEditing && (
            <TouchableOpacity 
              className="mt-2 flex-row items-center"
              onPress={() => Alert.alert("Add Certificate", "Certificate form not implemented")}
            >
              <Ionicons name="add-circle-outline" size={20} color="#1a73e8" />
              <Text className="text-blue-600 ml-1">Add Certificate</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Specializations Section */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Specializations</Text>
          <View className="flex-row flex-wrap">
            {profileData.specializations.map((spec, index) => (
              <View 
                key={index}
                className="bg-gray-100 rounded-full px-3 py-1 m-1"
              >
                <Text className="text-gray-800">{spec}</Text>
              </View>
            ))}
          </View>
          {isEditing && (
            <TouchableOpacity 
              className="mt-2 flex-row items-center"
              onPress={() => Alert.alert("Add Specialization", "Specialization selection not implemented")}
            >
              <Ionicons name="add-circle-outline" size={20} color="#1a73e8" />
              <Text className="text-blue-600 ml-1">Add Specialization</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Experience Section */}
        <View className="bg-white mt-4 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Years of Experience</Text>
          {isEditing ? (
            <TextInput
              value={profileData.years_of_experience.toString()}
              onChangeText={(text) => setProfileData({ ...profileData, years_of_experience: parseInt(text) || 0 })}
              className="text-gray-900"
              keyboardType="numeric"
            />
          ) : (
            <Text className="text-gray-900">
              {profileData.years_of_experience} years
            </Text>
          )}
        </View>

        {/* Availability Toggle */}
        <View className="bg-white mt-4 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-900">Available for Bookings</Text>
            <Switch
              value={profileData.is_available}
              onValueChange={(value) => setProfileData({ ...profileData, is_available: value })}
              disabled={!isEditing}
            />
          </View>
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
