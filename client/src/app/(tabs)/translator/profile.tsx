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

      setLoading(true);
      const response = await apiFetch<TranslatorProfile>(`/api/profiles/translator/${user.id}`, {
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
        colors={["#1a73e8", "#0d47a1"]}
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
                <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center border-4 border-white">
                  <Text className="text-blue-800 text-2xl font-bold">
                    {getInitials(profileData.name || user?.name || "")}
                  </Text>
                </View>
              )}
              {isEditing && (
                <TouchableOpacity
                  className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 border-2 border-white"
                  onPress={() => Alert.alert("Change Photo", "Photo upload not implemented")}
                >
                  <Ionicons name="camera" size={16} color="white" />
                </TouchableOpacity>
              )}
            </View>

            <View className="ml-4 flex-1 justify-center">
              <Text className="text-xl font-semibold text-gray-900">
                {profileData.name || user?.name || "Your Name"}
              </Text>

              <View className="flex-row items-center mt-1">
                <View className={`h-2 w-2 rounded-full ${profileData.is_available ? 'bg-green-500' : 'bg-gray-400'} mr-2`} />
                <Text className="text-gray-600">
                  {profileData.is_available ? 'Available for Bookings' : 'Not Available'}
                </Text>
              </View>
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

        {/* Quick Stats */}
        <View className="bg-white mx-4 mt-4 rounded-xl shadow-sm">
          <View className="flex-row justify-between divide-x divide-gray-100">
            <View className="flex-1 py-4 items-center">
              <Text className="text-blue-600 text-lg font-bold">€{profileData.hourly_rate}</Text>
              <Text className="text-gray-500 text-xs">Hourly Rate</Text>
            </View>
            <View className="flex-1 py-4 items-center">
              <Text className="text-blue-600 text-lg font-bold">{profileData.languages.length}</Text>
              <Text className="text-gray-500 text-xs">Languages</Text>
            </View>
            <View className="flex-1 py-4 items-center">
              <Text className="text-blue-600 text-lg font-bold">{profileData.years_of_experience}</Text>
              <Text className="text-gray-500 text-xs">Years Exp.</Text>
            </View>
          </View>
        </View>

        {/* Bio Section */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="person-outline" size={20} color="#1a73e8" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Bio</Text>
          </View>

          {isEditing ? (
            <TextInput
              value={profileData.bio}
              onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
              className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[100]"
              multiline
              placeholder="Tell travelers about yourself, your expertise, and your translation experience..."
            />
          ) : (
            <Text className="text-gray-600 leading-5">
              {profileData.bio || "No bio added yet. Add a bio to tell travelers about yourself and your translation experience."}
            </Text>
          )}
        </View>

        {/* Rate Section */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="euro" size={20} color="#1a73e8" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Hourly Rate</Text>
          </View>

          <View className="flex-row items-center bg-gray-50 p-3 rounded-lg">
            <Text className="text-gray-600 text-2xl">€</Text>
            {isEditing ? (
              <TextInput
                value={profileData.hourly_rate.toString()}
                onChangeText={(text) => setProfileData({ ...profileData, hourly_rate: parseFloat(text) || 0 })}
                className="text-gray-900 text-2xl ml-1 flex-1"
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
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="translate" size={20} color="#1a73e8" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Languages</Text>
          </View>

          {profileData.languages.length > 0 ? (
            <View className="divide-y divide-gray-100">
              {profileData.languages.map((language, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between py-3"
                >
                  <View className="flex-row items-center">
                    <Text className="text-gray-900 font-medium">{language.language_name}</Text>
                    {language.proficiency_level === "native" && (
                      <View className="bg-blue-100 rounded-full px-2 py-1 ml-2">
                        <Text className="text-blue-600 text-xs">Native</Text>
                      </View>
                    )}
                  </View>
                  <View className="bg-gray-100 rounded-full px-2 py-1">
                    <Text className="text-gray-700 text-xs capitalize">{language.proficiency_level}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-gray-500 italic">No languages added yet</Text>
          )}

          {isEditing && (
            <TouchableOpacity
              className="mt-3 flex-row items-center bg-blue-50 p-2 rounded-lg"
              onPress={() => Alert.alert("Add Language", "Language selection not implemented")}
            >
              <Ionicons name="add-circle-outline" size={20} color="#1a73e8" />
              <Text className="text-blue-600 ml-1 font-medium">Add Language</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Education Section */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <Ionicons name="school-outline" size={20} color="#1a73e8" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Education</Text>
          </View>

          {profileData.education.length > 0 ? (
            <View className="divide-y divide-gray-100">
              {profileData.education.map((edu, index) => (
                <View
                  key={index}
                  className="py-3"
                >
                  <Text className="text-gray-900 font-medium">{edu.degree}</Text>
                  <View className="flex-row justify-between mt-1">
                    <Text className="text-gray-600">{edu.institution}</Text>
                    <Text className="text-gray-500">{edu.year}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-gray-500 italic">No education history added yet</Text>
          )}

          {isEditing && (
            <TouchableOpacity
              className="mt-3 flex-row items-center bg-blue-50 p-2 rounded-lg"
              onPress={() => Alert.alert("Add Education", "Education form not implemented")}
            >
              <Ionicons name="add-circle-outline" size={20} color="#1a73e8" />
              <Text className="text-blue-600 ml-1 font-medium">Add Education</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Certificates Section */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="certificate-outline" size={20} color="#1a73e8" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Certificates</Text>
          </View>

          {profileData.certificates.length > 0 ? (
            <View className="divide-y divide-gray-100">
              {profileData.certificates.map((cert, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between py-3"
                >
                  <View>
                    <Text className="text-gray-900 font-medium">{cert.name}</Text>
                    <Text className="text-gray-600 text-sm">
                      {cert.issuer} • {cert.year}
                    </Text>
                  </View>
                  {cert.verified && (
                    <View className="flex-row items-center bg-green-100 rounded-full px-2 py-1">
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      <Text className="text-green-600 text-xs ml-1">Verified</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-gray-500 italic">No certificates added yet</Text>
          )}

          {isEditing && (
            <TouchableOpacity
              className="mt-3 flex-row items-center bg-blue-50 p-2 rounded-lg"
              onPress={() => Alert.alert("Add Certificate", "Certificate form not implemented")}
            >
              <Ionicons name="add-circle-outline" size={20} color="#1a73e8" />
              <Text className="text-blue-600 ml-1 font-medium">Add Certificate</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Specializations Section */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="star-outline" size={20} color="#1a73e8" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Specializations</Text>
          </View>

          {profileData.specializations.length > 0 ? (
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
          ) : (
            <Text className="text-gray-500 italic">No specializations added yet</Text>
          )}

          {isEditing && (
            <TouchableOpacity
              className="mt-3 flex-row items-center bg-blue-50 p-2 rounded-lg"
              onPress={() => Alert.alert("Add Specialization", "Specialization selection not implemented")}
            >
              <Ionicons name="add-circle-outline" size={20} color="#1a73e8" />
              <Text className="text-blue-600 ml-1 font-medium">Add Specialization</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Experience Section */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="clock-outline" size={20} color="#1a73e8" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Years of Experience</Text>
          </View>

          <View className="bg-gray-50 rounded-lg p-3">
            {isEditing ? (
              <TextInput
                value={profileData.years_of_experience.toString()}
                onChangeText={(text) => setProfileData({ ...profileData, years_of_experience: parseInt(text) || 0 })}
                className="text-gray-900"
                keyboardType="numeric"
              />
            ) : (
              <Text className="text-gray-900 font-medium">
                {profileData.years_of_experience} {profileData.years_of_experience === 1 ? 'year' : 'years'}
              </Text>
            )}
          </View>
        </View>

        {/* Availability Toggle */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialIcons name="event-available" size={20} color="#1a73e8" />
              <Text className="text-lg font-semibold text-gray-900 ml-2">Available for Bookings</Text>
            </View>
            <Switch
              value={profileData.is_available}
              onValueChange={(value) => setProfileData({ ...profileData, is_available: value })}
              disabled={!isEditing}
              trackColor={{ false: "#d1d5db", true: "#bfdbfe" }}
              thumbColor={profileData.is_available ? "#1a73e8" : "#9ca3af"}
            />
          </View>
          <Text className="text-gray-500 text-xs mt-1 ml-7">
            {profileData.is_available
              ? "You are currently visible to travelers and can receive bookings"
              : "You are hidden from search results and cannot receive new bookings"}
          </Text>
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
