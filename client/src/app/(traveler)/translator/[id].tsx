import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { apiFetch } from "@/src/services/api";
import { LinearGradient } from "expo-linear-gradient";

interface Language {
  language_code: string;
  language_name: string;
  proficiency_level: string;
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
  photo_url: string;
  languages: Language[];
  hourly_rate: number;
  location: string;
  bio: string;
  is_available: boolean;
  rating: number;
  booking_count: number;
  education: Education[];
  certificates: Certificate[];
  specializations: string[];
  years_of_experience: number;
  preferred_meeting_locations: string[];
}

export default function TranslatorDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [translator, setTranslator] = useState<TranslatorProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch translator details from API
  useEffect(() => {
    const fetchTranslatorDetails = async () => {
      try {
        setLoading(true);
        const response = await apiFetch<TranslatorProfile>(`/api/translators/${id}`);
        setTranslator(response);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching translator details:", error);
        setError("Could not load translator details. Please try again.");
        setLoading(false);
      }
    };

    fetchTranslatorDetails();
  }, [id]);

  const handleBookTranslator = () => {
    if (!translator?.is_available) {
      Alert.alert(
        "Translator Unavailable",
        "This translator is currently unavailable for bookings."
      );
      return;
    }

    // Navigate to booking screen with translator ID
    router.push(`/payment/${id}`);
  };

  const handleContactTranslator = () => {
    // Navigate to chat screen with translator ID
    router.push(`/${id}`);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text className="text-gray-600 mt-4">Loading translator details...</Text>
      </View>
    );
  }

  if (error || !translator) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Ionicons name="alert-circle-outline" size={48} color="#e53e3e" />
        <Text className="text-xl font-bold text-gray-900 mt-4">Error</Text>
        <Text className="text-gray-600 text-center mt-2">
          {error || "Could not find translator details."}
        </Text>
        <TouchableOpacity
          className="mt-6 bg-blue-600 px-5 py-2 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />
      
      {/* Custom header with gradient background */}
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <ScrollView className="flex-1">
        {/* Profile Header with Gradient */}
        <LinearGradient
          colors={["#1a73e8", "#0d47a1"]}
          className="p-4 pt-16 pb-6"
        >
          <TouchableOpacity
            className="absolute top-14 left-4 z-10 p-2"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="items-center">
            {translator.photo_url ? (
              <Image
                source={{ uri: translator.photo_url }}
                className="w-24 h-24 rounded-full border-2 border-white"
                defaultSource={require("@/assets/images/icon.png")}
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-blue-300 items-center justify-center border-2 border-white">
                <Text className="text-white text-2xl font-bold">
                  {translator.name.charAt(0)}
                </Text>
              </View>
            )}

            <Text className="text-white text-xl font-bold mt-2">
              {translator.name}
            </Text>

            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={16} color="white" />
              <Text className="text-white ml-1">
                {translator.location || "Location not specified"}
              </Text>
            </View>

            <View className="flex-row mt-3">
              <View className="items-center px-4">
                <View className="flex-row items-center">
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text className="text-white font-bold ml-1">
                    {translator.rating.toFixed(1)}
                  </Text>
                </View>
                <Text className="text-blue-100 text-xs mt-1">Rating</Text>
              </View>

              <View className="items-center px-4 border-l border-r border-blue-300">
                <Text className="text-white font-bold">
                  {translator.booking_count}
                </Text>
                <Text className="text-blue-100 text-xs mt-1">Sessions</Text>
              </View>

              <View className="items-center px-4">
                <Text className="text-white font-bold">
                  €{translator.hourly_rate.toFixed(2)}
                </Text>
                <Text className="text-blue-100 text-xs mt-1">Hourly</Text>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between mt-6">
            <TouchableOpacity
              className="flex-1 mr-2 bg-white rounded-full py-2 px-4 items-center"
              onPress={handleContactTranslator}
            >
              <Text className="text-blue-600 font-medium">Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 ml-2 rounded-full py-2 px-4 items-center ${
                translator.is_available
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
              onPress={handleBookTranslator}
              disabled={!translator.is_available}
            >
              <Text className="text-white font-medium">
                {translator.is_available ? "Book Now" : "Unavailable"}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* About Section */}
        <View className="bg-white p-4 mt-4">
          <Text className="text-lg font-bold text-gray-900 mb-2">About</Text>
          <Text className="text-gray-700 leading-5">
            {translator.bio || "No bio provided."}
          </Text>
        </View>

        {/* Languages Section */}
        <View className="bg-white p-4 mt-2">
          <Text className="text-lg font-bold text-gray-900 mb-2">Languages</Text>
          <View className="flex-row flex-wrap">
            {translator.languages.map((lang, index) => (
              <View
                key={index}
                className="bg-blue-50 rounded-full px-3 py-1 mr-2 mb-2"
              >
                <Text className="text-blue-700">
                  {lang.language_name} 
                  {lang.proficiency_level && ` (${lang.proficiency_level})`}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Education Section */}
        {translator.education && translator.education.length > 0 && (
          <View className="bg-white p-4 mt-2">
            <Text className="text-lg font-bold text-gray-900 mb-2">
              Education
            </Text>
            {translator.education.map((edu, index) => (
              <View key={index} className="mb-2">
                <Text className="text-gray-900 font-medium">
                  {edu.degree}
                </Text>
                <Text className="text-gray-600">
                  {edu.institution}, {edu.year}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Certificates Section */}
        {translator.certificates && translator.certificates.length > 0 && (
          <View className="bg-white p-4 mt-2">
            <Text className="text-lg font-bold text-gray-900 mb-2">
              Certificates
            </Text>
            {translator.certificates.map((cert, index) => (
              <View key={index} className="flex-row justify-between mb-2">
                <View>
                  <Text className="text-gray-900 font-medium">
                    {cert.name}
                  </Text>
                  <Text className="text-gray-600">
                    {cert.issuer}, {cert.year}
                  </Text>
                </View>
                {cert.verified && (
                  <View className="flex-row items-center">
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#10B981"
                    />
                    <Text className="text-green-600 ml-1">Verified</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Specializations Section */}
        {translator.specializations && translator.specializations.length > 0 && (
          <View className="bg-white p-4 mt-2">
            <Text className="text-lg font-bold text-gray-900 mb-2">
              Specializations
            </Text>
            <View className="flex-row flex-wrap">
              {translator.specializations.map((spec, index) => (
                <View
                  key={index}
                  className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2"
                >
                  <Text className="text-gray-700">{spec}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Preferred Meeting Locations */}
        {translator.preferred_meeting_locations && 
         translator.preferred_meeting_locations.length > 0 && (
          <View className="bg-white p-4 mt-2 mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-2">
              Preferred Meeting Locations
            </Text>
            {translator.preferred_meeting_locations.map((location, index) => (
              <View key={index} className="flex-row items-center mb-1">
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text className="text-gray-700 ml-2">{location}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Book Now Button (Bottom) */}
        <View className="p-4 mb-4">
          <TouchableOpacity
            className={`w-full py-3 px-4 rounded-xl items-center ${
              translator.is_available
                ? "bg-blue-600"
                : "bg-gray-400"
            }`}
            onPress={handleBookTranslator}
            disabled={!translator.is_available}
          >
            <Text className="text-white font-bold text-lg">
              {translator.is_available ? "Book This Translator" : "Currently Unavailable"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
} 