import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  RefreshControl,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";

// Mock data for demonstration
const nearbyTranslators = [
  {
    id: 1,
    name: "Emma Chen",
    language: "Chinese",
    rating: 4.8,
    distance: "0.5 km",
    online: true,
    hourlyRate: 25,
    totalJobs: 145,
    image: null,
  },
  {
    id: 2,
    name: "Miguel Lopez",
    language: "Spanish",
    rating: 4.9,
    distance: "1.2 km",
    online: true,
    hourlyRate: 30,
    totalJobs: 89,
    image: null,
  },
  {
    id: 3,
    name: "Yuki Tanaka",
    language: "Japanese",
    rating: 4.7,
    distance: "2.0 km",
    online: false,
    hourlyRate: 28,
    totalJobs: 67,
    image: null,
  },
  {
    id: 4,
    name: "Hans Mueller",
    language: "German",
    rating: 4.6,
    distance: "2.5 km",
    online: true,
    hourlyRate: 22,
    totalJobs: 124,
    image: null,
  },
];

// List of languages for filters
const languages = [
  { id: "all", name: "All" },
  { id: "en", name: "English" },
  { id: "zh", name: "Chinese" },
  { id: "es", name: "Spanish" },
  { id: "ja", name: "Japanese" },
  { id: "de", name: "German" },
  { id: "fr", name: "French" },
  { id: "hi", name: "Hindi" },
];

export default function TravelerHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Filter translators based on search, language, and online status
  const filteredTranslators = nearbyTranslators.filter((translator) => {
    // Search query filter
    const matchesSearch =
      searchQuery === "" ||
      translator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      translator.language.toLowerCase().includes(searchQuery.toLowerCase());

    // Language filter
    const matchesLanguage =
      selectedLanguage === "all" ||
      translator.language.toLowerCase() === selectedLanguage.toLowerCase();

    // Online status filter
    const matchesOnlineStatus = !showOnlineOnly || translator.online;

    return matchesSearch && matchesLanguage && matchesOnlineStatus;
  });

  const navigateToTranslatorProfile = (id: number) => {
    // TODO: Implement navigation to translator profile
    console.log(`Navigate to translator profile: ${id}`);
  };

  return (
    <ScrollView
      className="flex-1 bg-neutral-gray-100"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Header */}
      <View className="bg-primary px-5 pt-4 pb-10 rounded-b-3xl">
        <Text className="text-white text-lg opacity-80">
          {t("home.greeting")}
          {user?.name ? `, ${user.name.split(" ")[0]}!` : "!"}
        </Text>
        <Text className="text-white text-2xl font-bold mt-1">
          {t("home.findTranslator")}
        </Text>

        {/* Search Bar */}
        <View className="flex-row items-center mt-5 bg-white rounded-full px-4 py-2">
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            className="flex-1 ml-2 text-neutral-gray-800"
            placeholder={t("home.searchPlaceholder")}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            className="bg-neutral-gray-200 rounded-full p-2"
            onPress={() => {}}
          >
            <Ionicons name="options-outline" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Filter */}
      <View className="mt-4 px-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={languages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedLanguage(item.id)}
              className={`px-4 py-2 mr-2 rounded-full ${
                selectedLanguage === item.id
                  ? "bg-primary"
                  : "bg-neutral-gray-200"
              }`}
            >
              <Text
                className={`${
                  selectedLanguage === item.id
                    ? "text-white font-medium"
                    : "text-neutral-gray-700"
                }`}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Online Only Switch */}
      <View className="flex-row items-center justify-end mt-2 px-4">
        <Text className="text-neutral-gray-600 mr-2">Online Only</Text>
        <TouchableOpacity
          onPress={() => setShowOnlineOnly(!showOnlineOnly)}
          className={`w-12 h-6 rounded-full ${
            showOnlineOnly ? "bg-primary" : "bg-neutral-gray-300"
          } justify-center`}
        >
          <View
            className={`w-5 h-5 bg-white rounded-full shadow ${
              showOnlineOnly ? "ml-6" : "ml-1"
            }`}
          />
        </TouchableOpacity>
      </View>

      {/* Translators List */}
      <View className="mt-4 px-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-bold text-neutral-gray-800">
            {filteredTranslators.length > 0
              ? "Available Translators"
              : "No Translators Found"}
          </Text>
          <TouchableOpacity>
            <Text className="text-primary">See All</Text>
          </TouchableOpacity>
        </View>

        {filteredTranslators.map((translator) => (
          <TouchableOpacity
            key={translator.id}
            className="translator-card mb-4"
            onPress={() => navigateToTranslatorProfile(translator.id)}
          >
            <View className="flex-row">
              {/* Avatar */}
              {translator.image ? (
                <Image
                  source={{ uri: translator.image }}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <View className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <Text className="text-white text-xl font-bold">
                    {translator.name.charAt(0)}
                  </Text>
                </View>
              )}

              {/* Info */}
              <View className="flex-1 ml-3 justify-center">
                <View className="flex-row items-center">
                  <Text className="text-neutral-gray-800 text-lg font-semibold">
                    {translator.name}
                  </Text>
                  <View
                    className={`ml-2 w-2 h-2 rounded-full ${
                      translator.online
                        ? "bg-success"
                        : "bg-neutral-gray-400"
                    }`}
                  />
                </View>

                <View className="flex-row items-center mt-1">
                  <Ionicons name="language-outline" size={16} color="#666" />
                  <Text className="ml-1 text-neutral-gray-600">
                    {translator.language}
                  </Text>
                  <Text className="mx-2 text-neutral-gray-400">•</Text>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text className="ml-1 text-neutral-gray-600">
                    {translator.rating}
                  </Text>
                </View>

                <View className="flex-row items-center mt-1">
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text className="ml-1 text-neutral-gray-600">
                    {translator.distance}
                  </Text>
                  <Text className="mx-2 text-neutral-gray-400">•</Text>
                  <Ionicons name="briefcase-outline" size={16} color="#666" />
                  <Text className="ml-1 text-neutral-gray-600">
                    {translator.totalJobs} jobs
                  </Text>
                </View>
              </View>

              {/* Price */}
              <View className="justify-center items-end">
                <Text className="text-primary text-lg font-bold">
                  ${translator.hourlyRate}
                </Text>
                <Text className="text-neutral-gray-500 text-xs">per hour</Text>
              </View>
            </View>

            {/* Quick Action Buttons */}
            <View className="flex-row justify-between mt-3 pt-3 border-t border-neutral-gray-200">
              <TouchableOpacity className="flex-row items-center">
                <Ionicons name="calendar-outline" size={18} color="#007BFF" />
                <Text className="ml-1 text-primary">Book</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row items-center">
                <Ionicons name="chatbubble-outline" size={18} color="#007BFF" />
                <Text className="ml-1 text-primary">Message</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row items-center">
                <Ionicons name="call-outline" size={18} color="#007BFF" />
                <Text className="ml-1 text-primary">Call</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Popular Locations */}
      <View className="mt-2 px-4 pb-6">
        <Text className="text-lg font-bold text-neutral-gray-800 mb-2">
          Popular Locations
        </Text>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="pb-2"
        >
          {["Tokyo", "Paris", "New York", "Delhi", "Bangkok"].map((city, index) => (
            <TouchableOpacity
              key={index}
              className="mr-3 bg-white rounded-lg shadow-sm overflow-hidden w-40"
            >
              <View className="h-24 bg-primary opacity-80" />
              <View className="p-2">
                <Text className="font-medium">{city}</Text>
                <Text className="text-xs text-neutral-gray-500">
                  {10 + index * 3} translators available
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
} 