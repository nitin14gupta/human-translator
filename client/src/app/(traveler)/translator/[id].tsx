import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { apiFetch, getBookings } from "@/src/services/api";
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
  const [hasActiveBooking, setHasActiveBooking] = useState(false);

  // Fetch translator details and check for active bookings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch translator details
        const translatorResponse = await apiFetch<TranslatorProfile>(`/api/translators/${id}`);
        setTranslator(translatorResponse);

        // Check if user has active bookings with this translator
        await checkActiveBookings(id as string);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching translator details:", error);
        setError("Could not load translator details. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Check if traveler has active bookings with this translator
  const checkActiveBookings = async (translatorId: string) => {
    try {
      // Get upcoming bookings
      const bookings = await getBookings("upcoming");

      // Check if any booking is with this translator
      const hasBooking = bookings.some(
        booking => booking.other_user_id === translatorId &&
          (booking.status === "confirmed" || booking.status === "pending")
      );

      setHasActiveBooking(hasBooking);
    } catch (error) {
      console.error("Error checking bookings:", error);
      setHasActiveBooking(false);
    }
  };

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

  const getAvailabilityStatus = () => {
    if (hasActiveBooking) {
      return {
        label: "Already Booked",
        color: "#10B981", // green
        icon: "check-circle"
      };
    } else if (translator?.is_available) {
      return {
        label: "Available Now",
        color: "#10B981", // green
        icon: "access-time"
      };
    } else {
      return {
        label: "Unavailable",
        color: "#6B7280", // gray
        icon: "schedule"
      };
    }
  };

  const status = getAvailabilityStatus();

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

            {/* Availability Badge */}
            <View
              className="flex-row items-center bg-white/20 px-3 py-1 rounded-full mt-2"
              style={{ borderColor: status.color, borderWidth: 1 }}
            >
              <MaterialIcons name={status.icon as any} size={14} color={status.color} />
              <Text style={{ color: status.color }} className="ml-1 font-medium">
                {status.label}
              </Text>
            </View>

            <View className="flex-row mt-3 w-full justify-evenly">
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

          {/* Book Now Button */}
          <TouchableOpacity
            className={`w-full py-3 px-4 rounded-xl items-center mt-6 ${hasActiveBooking
              ? "bg-blue-800"
              : translator.is_available
                ? "bg-green-500"
                : "bg-gray-400"
              }`}
            onPress={handleBookTranslator}
            disabled={!translator.is_available || hasActiveBooking}
          >
            <Text className="text-white font-bold text-base">
              {hasActiveBooking
                ? "Already Booked"
                : translator.is_available
                  ? "Book Now"
                  : "Currently Unavailable"
              }
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Experience Badge */}
        {translator.years_of_experience > 0 && (
          <View className="flex-row items-center bg-blue-50 p-4 mx-4 mt-4 rounded-xl">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
              <MaterialCommunityIcons name="certificate" size={20} color="#1a73e8" />
            </View>
            <View className="ml-3">
              <Text className="text-blue-800 font-bold">Experienced Translator</Text>
              <Text className="text-gray-600">
                {translator.years_of_experience} {translator.years_of_experience === 1 ? 'year' : 'years'} of translation experience
              </Text>
            </View>
          </View>
        )}

        {/* About Section */}
        <View className="bg-white p-4 mt-4 rounded-xl mx-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="person-outline" size={20} color="#1a73e8" />
            <Text className="text-lg font-bold text-gray-900 ml-2">About</Text>
          </View>
          <Text className="text-gray-700 leading-5">
            {translator.bio || "No bio provided."}
          </Text>
        </View>

        {/* Languages Section */}
        <View className="bg-white p-4 mt-4 rounded-xl mx-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="translate" size={20} color="#1a73e8" />
            <Text className="text-lg font-bold text-gray-900 ml-2">Languages</Text>
          </View>
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
          <View className="bg-white p-4 mt-4 rounded-xl mx-4 shadow-sm">
            <View className="flex-row items-center mb-2">
              <Ionicons name="school-outline" size={20} color="#1a73e8" />
              <Text className="text-lg font-bold text-gray-900 ml-2">
                Education
              </Text>
            </View>
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
          <View className="bg-white p-4 mt-4 rounded-xl mx-4 shadow-sm">
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons name="certificate-outline" size={20} color="#1a73e8" />
              <Text className="text-lg font-bold text-gray-900 ml-2">
                Certificates
              </Text>
            </View>
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
          <View className="bg-white p-4 mt-4 rounded-xl mx-4 shadow-sm">
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="star-outline" size={20} color="#1a73e8" />
              <Text className="text-lg font-bold text-gray-900 ml-2">
                Specializations
              </Text>
            </View>
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
            <View className="bg-white p-4 mt-4 mb-4 rounded-xl mx-4 shadow-sm">
              <View className="flex-row items-center mb-2">
                <Ionicons name="location-outline" size={20} color="#1a73e8" />
                <Text className="text-lg font-bold text-gray-900 ml-2">
                  Preferred Meeting Locations
                </Text>
              </View>
              {translator.preferred_meeting_locations.map((location, index) => (
                <View key={index} className="flex-row items-center mb-1">
                  <View className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                  <Text className="text-gray-700">{location}</Text>
                </View>
              ))}
            </View>
          )}

        {/* Book Now Button (Bottom) */}
        <View className="p-4 mb-4">
          <TouchableOpacity
            className={`w-full py-3 px-4 rounded-xl items-center ${hasActiveBooking
              ? "bg-blue-800"
              : translator.is_available
                ? "bg-blue-600"
                : "bg-gray-400"
              }`}
            onPress={handleBookTranslator}
            disabled={!translator.is_available || hasActiveBooking}
          >
            <View className="flex-row items-center">
              {hasActiveBooking ? (
                <Ionicons name="checkmark-circle" size={20} color="white" />
              ) : translator.is_available ? (
                <Ionicons name="calendar" size={20} color="white" />
              ) : (
                <Ionicons name="time-outline" size={20} color="white" />
              )}
              <Text className="text-white font-bold text-lg ml-2">
                {hasActiveBooking
                  ? "Already Booked"
                  : translator.is_available
                    ? "Book This Translator"
                    : "Currently Unavailable"
                }
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

//ye translator detail screen hai