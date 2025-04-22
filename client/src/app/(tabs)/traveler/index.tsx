import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { apiFetch } from "../../../services/api";

interface Language {
  language_code: string;
  language_name: string;
  proficiency_level?: string;
}

interface Translator {
  id: string;
  full_name: string;
  photo_url: string;
  languages: Language[];
  location: string;
  rating: number;
  reviews: number;
  hourly_rate: number;
  is_available: boolean;
  total_sessions: number;
}

interface SearchResponse {
  translators: Translator[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "available" | "top">("all");
  const [translators, setTranslators] = useState<Translator[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Function to fetch translators
  const fetchTranslators = async (page: number = 1) => {
    try {
      const params = new URLSearchParams();

      // Add search query as location filter
      if (searchQuery) {
        params.append('location', searchQuery);
      }

      // Add filters
      if (activeFilter === 'available') {
        params.append('available', 'true');
      } else if (activeFilter === 'top') {
        params.append('min_rating', '4.8');
      }

      params.append('page', page.toString());
      params.append('per_page', '10');

      const response = await apiFetch<SearchResponse>(`/api/translators/search?${params.toString()}`);

      // Add null check for the response and translators array
      if (response && Array.isArray(response.translators)) {
        setTranslators(response.translators);
        setCurrentPage(page);
        return response;
      } else {
        console.error('Invalid response format or missing translators array');
        setTranslators([]);
        return null;
      }
    } catch (error) {
      console.error('Error fetching translators:', error);
      setTranslators([]);
      return null;
    }
  };

  // Initial load
  useEffect(() => {
    const loadTranslators = async () => {
      setLoading(true);
      await fetchTranslators();
      setLoading(false);
    };
    loadTranslators();
  }, []);

  // Refresh when search or filter changes
  useEffect(() => {
    const refreshSearch = async () => {
      setLoading(true);
      await fetchTranslators(1); // Reset to first page
      setLoading(false);
    };
    refreshSearch();
  }, [searchQuery, activeFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTranslators(currentPage);
    setRefreshing(false);
  };

  // Helper function to truncate long text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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
            placeholder="Search by location"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Tabs */}
        <View className="flex-row mt-4 bg-gray-100 rounded-full p-1">
          {(["all", "available", "top"] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              className={`flex-1 py-2 px-3 rounded-full ${activeFilter === filter ? "bg-blue-600" : "bg-transparent"
                }`}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                className={`text-center font-medium ${activeFilter === filter ? "text-white" : "text-gray-600"
                  }`}
              >
                {filter === "all" ? "All" :
                  filter === "available" ? "Available" : "Top Rated"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Translator List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          {loading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#1a73e8" />
              <Text className="text-gray-600 mt-4">Finding translators...</Text>
            </View>
          ) : translators.length === 0 ? (
            <View className="items-center justify-center py-12">
              <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-4">
                <Ionicons name="search" size={32} color="#1a73e8" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                No translators found
              </Text>
              <Text className="text-gray-600 text-center mx-8">
                Try adjusting your search criteria or explore different locations
              </Text>
            </View>
          ) : (
            translators.map((translator) => (
              <TouchableOpacity
                key={translator.id}
                className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
                onPress={() => router.push(`/translator/${translator.id}`)}
              >
                <View className="flex-row">
                  {/* Translator Photo */}
                  <View className="relative">
                    <Image
                      source={{ uri: translator.photo_url }}
                      className="w-20 h-20 rounded-xl"
                      defaultSource={require('@/assets/images/icon.png')}
                      onError={(e) => {
                        console.log('Error loading image:', e.nativeEvent.error);
                      }}
                    />
                    {translator.is_available && (
                      <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </View>

                  {/* Translator Details */}
                  <View className="flex-1 ml-4 justify-between">
                    <View>
                      {/* Name and Location */}
                      <Text className="text-lg font-semibold text-gray-900">
                        {translator?.full_name ? truncateText(translator.full_name, 20) : 'Unknown'}
                      </Text>

                      <View className="flex-row items-center mt-1">
                        <Ionicons name="location-outline" size={14} color="#6B7280" />
                        <Text className="text-gray-600 text-sm ml-1">
                          {translator?.location || 'Location not specified'}
                        </Text>
                      </View>

                      {/* Rating */}
                      <View className="flex-row items-center mt-2">
                        <Ionicons name="star" size={16} color="#F59E0B" />
                        <Text className="text-gray-900 ml-1 font-medium">
                          {translator?.rating ? translator.rating.toFixed(1) : '0.0'}
                        </Text>
                        <Text className="text-gray-600 ml-1 text-sm">
                          ({translator?.reviews || 0} reviews)
                        </Text>

                        {translator?.total_sessions > 0 && (
                          <View className="flex-row items-center ml-2 bg-blue-50 px-2 py-0.5 rounded">
                            <MaterialCommunityIcons name="check-decagram" size={12} color="#1a73e8" />
                            <Text className="text-blue-600 text-xs ml-1">
                              {translator.total_sessions} sessions
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Languages and Price */}
                    <View className="mt-2">
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons name="translate" size={14} color="#6B7280" />
                        <Text className="text-gray-600 text-sm ml-1 flex-shrink">
                          {translator?.languages && Array.isArray(translator.languages)
                            ? translator.languages.map(l => l?.language_name || '').filter(Boolean).join(" • ")
                            : 'No languages specified'}
                        </Text>
                      </View>

                      <View className="flex-row justify-between items-center mt-2">
                        <View className="flex-row items-center">
                          {translator?.is_available ? (
                            <View className="bg-green-100 rounded-full px-2 py-1">
                              <Text className="text-green-600 text-xs">Available Now</Text>
                            </View>
                          ) : (
                            <View className="bg-gray-100 rounded-full px-2 py-1">
                              <Text className="text-gray-600 text-xs">Not Available</Text>
                            </View>
                          )}
                        </View>

                        <Text className="text-blue-600 font-bold">
                          €{translator?.hourly_rate ? translator.hourly_rate.toFixed(2) : '0.00'}/hr
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
