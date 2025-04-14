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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
      setTranslators(response.translators);
      setCurrentPage(page);
      return response;
    } catch (error) {
      console.error('Error fetching translators:', error);
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
            <Text className="text-center text-gray-600">Loading...</Text>
          ) : translators.length === 0 ? (
            <Text className="text-center text-gray-600">No translators found</Text>
          ) : (
            translators.map((translator) => (
              <TouchableOpacity
                key={translator.id}
                className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
                onPress={() => router.push(`/translator/${translator.id}`)}
              >
                <View className="flex-row">
                  <Image
                    source={{ uri: translator.photo_url }}
                    className="w-20 h-20 rounded-xl"
                    defaultSource={require('@/assets/images/icon.png')}
                    onError={(e) => {
                      console.log('Error loading image:', e.nativeEvent.error);
                    }}
                  />
                  <View className="flex-1 ml-4">
                    <View className="flex-row justify-between items-start">
                      <View>
                        <Text className="text-lg font-semibold text-gray-900">
                          {translator.full_name}
                        </Text>
                        <Text className="text-gray-600 text-sm">
                          {translator.location || 'Location not specified'}
                        </Text>
                      </View>
                      {translator.is_available && (
                        <View className="bg-green-100 rounded-full px-2 py-1">
                          <Text className="text-green-600 text-xs">Available</Text>
                        </View>
                      )}
                    </View>

                    <View className="flex-row items-center mt-2">
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text className="text-gray-900 ml-1">{translator.rating.toFixed(1)}</Text>
                      <Text className="text-gray-600 ml-1">
                        ({translator.reviews} reviews)
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-2">
                      <Text className="text-gray-600 text-sm">
                        {translator.languages.map(l => l.language_name).join(" • ")}
                      </Text>
                      <Text className="text-blue-600 font-semibold">
                        €{translator.hourly_rate.toFixed(2)}/hr
                      </Text>
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
