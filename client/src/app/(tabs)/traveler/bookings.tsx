import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";

// Mock data for bookings
const MOCK_BOOKINGS = [
  {
    id: "b1",
    translatorName: "Sophie Martin",
    translatorImage: "https://randomuser.me/api/portraits/women/44.jpg",
    location: "Eiffel Tower, Paris",
    date: "2023-05-24",
    time: "10:00 AM",
    duration: 2,
    status: "upcoming",
    languages: ["English", "French"],
    amount: 120,
  },
  {
    id: "b2",
    translatorName: "Hiroshi Tanaka",
    translatorImage: "https://randomuser.me/api/portraits/men/32.jpg",
    location: "Tokyo Skytree, Tokyo",
    date: "2023-05-28",
    time: "09:00 AM",
    duration: 3,
    status: "upcoming",
    languages: ["English", "Japanese"],
    amount: 180,
  },
  {
    id: "b3",
    translatorName: "Maria Rodriguez",
    translatorImage: "https://randomuser.me/api/portraits/women/68.jpg",
    location: "Park Güell, Barcelona",
    date: "2023-05-10",
    time: "11:00 AM",
    duration: 2,
    status: "completed",
    languages: ["English", "Spanish"],
    amount: 110,
    rating: 4.8,
  },
  {
    id: "b4",
    translatorName: "Wei Chen",
    translatorImage: "https://randomuser.me/api/portraits/men/52.jpg",
    location: "Great Wall, Beijing",
    date: "2023-05-15",
    time: "08:30 AM",
    duration: 4,
    status: "completed",
    languages: ["English", "Chinese"],
    amount: 220,
    rating: 5.0,
  },
  {
    id: "b5",
    translatorName: "Anna Petrova",
    translatorImage: "https://randomuser.me/api/portraits/women/33.jpg",
    location: "Red Square, Moscow",
    date: "2023-05-05",
    time: "10:00 AM",
    duration: 3,
    status: "cancelled",
    languages: ["English", "Russian"],
    amount: 150,
  },
];

const { width } = Dimensions.get("window");

export default function TravelerBookingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("upcoming");
  const [sortBy, setSortBy] = useState("date");

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Filter bookings based on active filter
  const filteredBookings = MOCK_BOOKINGS.filter(
    (booking) => booking.status === activeFilter
  );

  // Sort bookings based on sort selection
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.date) - new Date(a.date); // newest first
    } else if (sortBy === "price") {
      return b.amount - a.amount; // highest first
    } else if (sortBy === "duration") {
      return b.duration - a.duration; // longest first
    }
    return 0;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-indigo-100 text-indigo-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <View className="flex-1 bg-neutral-gray-100">
      <View className="bg-primary px-5 pt-4 pb-6">
        <Text className="text-white text-xl font-bold">{t("bookings.title")}</Text>
        <Text className="text-white text-opacity-80 mt-1">
          {t("bookings.subtitle")}
        </Text>

        {/* Filters */}
        <View className="flex-row mt-4 bg-white bg-opacity-10 rounded-lg p-1">
          {["upcoming", "completed", "cancelled"].map((filter) => (
            <TouchableOpacity
              key={filter}
              className={`flex-1 py-2 px-3 rounded-md ${
                activeFilter === filter
                  ? "bg-white"
                  : "bg-transparent"
              }`}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                className={`text-center text-sm font-medium ${
                  activeFilter === filter
                    ? "text-primary"
                    : "text-white"
                }`}
              >
                {t(`bookings.${filter}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sorting Options */}
      <View className="flex-row justify-between items-center px-5 py-3 border-b border-neutral-gray-200">
        <Text className="text-neutral-gray-600">
          {sortedBookings.length} {t("bookings.found")}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-neutral-gray-600 mr-2">{t("bookings.sortBy")}</Text>
          <TouchableOpacity
            className="flex-row items-center bg-white px-3 py-1 rounded-md shadow-sm"
            onPress={() => {
              // Toggle between sorting options
              if (sortBy === "date") setSortBy("price");
              else if (sortBy === "price") setSortBy("duration");
              else setSortBy("date");
            }}
          >
            <Text className="text-primary font-medium mr-1">
              {t(`bookings.${sortBy}`)}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#007BFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {sortedBookings.length > 0 ? (
          <View className="p-4">
            {sortedBookings.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
                onPress={() => router.push(`/booking/${booking.id}`)}
              >
                {/* Booking Card Header */}
                <View className="p-4 border-b border-neutral-gray-100">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Image
                        source={{ uri: booking.translatorImage }}
                        className="w-10 h-10 rounded-full"
                      />
                      <View className="ml-3">
                        <Text className="text-neutral-gray-800 font-medium">
                          {booking.translatorName}
                        </Text>
                        <View className="flex-row items-center">
                          <MaterialIcons
                            name="translate"
                            size={14}
                            color="#6C757D"
                          />
                          <Text className="text-xs text-neutral-gray-600 ml-1">
                            {booking.languages.join(" → ")}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View
                      className={`py-1 px-2 rounded-full ${
                        getStatusColor(booking.status)
                      }`}
                    >
                      <Text className="text-xs font-medium">
                        {t(`bookings.${booking.status}`)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Booking Details */}
                <View className="p-4">
                  <View className="flex-row items-center mb-2">
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#6C757D"
                    />
                    <Text className="text-sm text-neutral-gray-700 ml-2">
                      {booking.location}
                    </Text>
                  </View>

                  <View className="flex-row items-center mb-2">
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#6C757D"
                    />
                    <Text className="text-sm text-neutral-gray-700 ml-2">
                      {formatDate(booking.date)} • {booking.time}
                    </Text>
                  </View>

                  <View className="flex-row items-center mb-2">
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color="#6C757D"
                    />
                    <Text className="text-sm text-neutral-gray-700 ml-2">
                      {booking.duration} {t("bookings.hours")}
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-neutral-gray-100">
                    <Text className="text-primary font-bold">
                      ${booking.amount}
                    </Text>
                    <View className="flex-row">
                      {booking.status === "upcoming" && (
                        <>
                          <TouchableOpacity
                            className="flex-row items-center mr-4"
                            onPress={(e) => {
                              e.stopPropagation();
                              // Handle reschedule
                            }}
                          >
                            <Ionicons
                              name="calendar-outline"
                              size={14}
                              color="#007BFF"
                            />
                            <Text className="text-primary text-sm ml-1">
                              {t("bookings.reschedule")}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="flex-row items-center"
                            onPress={(e) => {
                              e.stopPropagation();
                              // Handle cancel
                            }}
                          >
                            <Ionicons
                              name="close-circle-outline"
                              size={14}
                              color="#DC3545"
                            />
                            <Text className="text-error text-sm ml-1">
                              {t("bookings.cancel")}
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}

                      {booking.status === "completed" && (
                        <View className="flex-row items-center">
                          <Text className="text-sm text-neutral-gray-600 mr-1">
                            {t("bookings.rating")}:
                          </Text>
                          <Text className="font-medium text-neutral-gray-800">
                            {booking.rating}
                          </Text>
                          <Ionicons
                            name="star"
                            size={14}
                            color="#FFC107"
                            style={{ marginLeft: 2 }}
                          />
                        </View>
                      )}

                      {booking.status === "cancelled" && (
                        <TouchableOpacity
                          className="flex-row items-center"
                          onPress={(e) => {
                            e.stopPropagation();
                            // Handle rebook
                          }}
                        >
                          <Ionicons
                            name="refresh-outline"
                            size={14}
                            color="#007BFF"
                          />
                          <Text className="text-primary text-sm ml-1">
                            {t("bookings.rebook")}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center p-10 mt-10">
            <Ionicons
              name={
                activeFilter === "upcoming"
                  ? "calendar-outline"
                  : activeFilter === "completed"
                  ? "checkmark-done-outline"
                  : "close-circle-outline"
              }
              size={64}
              color="#CCC"
            />
            <Text className="text-lg font-bold text-neutral-gray-600 mt-4">
              {t(`bookings.no${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}Bookings`)}
            </Text>
            <Text className="text-neutral-gray-500 text-center mt-2">
              {activeFilter === "upcoming"
                ? t("bookings.noUpcomingDescription")
                : activeFilter === "completed"
                ? t("bookings.noCompletedDescription")
                : t("bookings.noCancelledDescription")}
            </Text>
            {activeFilter === "upcoming" && (
              <TouchableOpacity
                className="mt-6 bg-primary px-6 py-3 rounded-full"
                onPress={() => router.push("/(tabs)/traveler/")}
              >
                <Text className="text-white font-medium">
                  {t("bookings.findTranslator")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
} 