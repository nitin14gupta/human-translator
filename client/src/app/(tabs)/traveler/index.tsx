import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

interface Translator {
  id: string;
  name: string;
  photo: string;
  languages: string[];
  location: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  available: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "available" | "top">("all");

  // Mock data for featured translators
  const translators: Translator[] = [
    {
      id: "1",
      name: "Sarah Martin",
      photo: "https://placekitten.com/200/200",
      languages: ["English", "French", "Spanish"],
      location: "Paris, France",
      rating: 4.9,
      reviews: 124,
      hourlyRate: 45,
      available: true,
    },
    {
      id: "2",
      name: "Jean Dupont",
      photo: "https://placekitten.com/201/201",
      languages: ["French", "English"],
      location: "Lyon, France",
      rating: 4.8,
      reviews: 89,
      hourlyRate: 40,
      available: true,
    },
    {
      id: "3",
      name: "Maria Garcia",
      photo: "https://placekitten.com/202/202",
      languages: ["Spanish", "French", "English"],
      location: "Barcelona, Spain",
      rating: 4.7,
      reviews: 56,
      hourlyRate: 35,
      available: false,
    },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1500);
  };

  const filteredTranslators = translators.filter(translator => {
    if (activeFilter === "available" && !translator.available) return false;
    if (activeFilter === "top" && translator.rating < 4.8) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        translator.name.toLowerCase().includes(query) ||
        translator.languages.some(lang => lang.toLowerCase().includes(query)) ||
        translator.location.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4">
        <Text className="text-2xl font-bold text-gray-900">Find a Translator</Text>
        <Text className="text-gray-600 mt-1">Connect with local translators</Text>
      </View>

      {/* Search Bar */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-2 text-gray-900"
            placeholder="Search by language, location, or name"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white py-2"
      >
        {(["all", "available", "top"] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            className={`px-4 py-2 mx-2 rounded-full ${
              activeFilter === filter
                ? "bg-blue-600"
                : "bg-gray-100"
            }`}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              className={`font-medium ${
                activeFilter === filter
                  ? "text-white"
                  : "text-gray-600"
              }`}
            >
              {filter === "all"
                ? "All Translators"
                : filter === "available"
                ? "Available Now"
                : "Top Rated"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Translator List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          {filteredTranslators.map((translator) => (
            <TouchableOpacity
              key={translator.id}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
              onPress={() => router.push(`/translator/${translator.id}`)}
            >
              <View className="flex-row">
                <Image
                  source={{ uri: translator.photo }}
                  className="w-20 h-20 rounded-xl"
                />
                <View className="flex-1 ml-4">
                  <View className="flex-row justify-between items-start">
                    <View>
                      <Text className="text-lg font-semibold text-gray-900">
                        {translator.name}
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        {translator.location}
                      </Text>
                    </View>
                    {translator.available && (
                      <View className="bg-green-100 rounded-full px-2 py-1">
                        <Text className="text-green-600 text-xs">Available</Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row items-center mt-2">
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text className="text-gray-900 ml-1">{translator.rating}</Text>
                    <Text className="text-gray-600 ml-1">
                      ({translator.reviews} reviews)
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-gray-600 text-sm">
                      {translator.languages.join(" • ")}
                    </Text>
                    <Text className="text-blue-600 font-semibold">
                      €{translator.hourlyRate}/hr
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
