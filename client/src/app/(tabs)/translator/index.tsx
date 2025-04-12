import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

// Mock data for upcoming bookings
const MOCK_BOOKINGS = [
  {
    id: "b1",
    travelerName: "John Smith",
    location: "Tokyo Tower",
    date: "2024-03-25",
    time: "14:00",
    duration: 2,
    amount: 120,
    status: "pending",
  },
  {
    id: "b2",
    travelerName: "Emma Wilson",
    location: "Shibuya Crossing",
    date: "2024-03-26",
    time: "10:00",
    duration: 3,
    amount: 180,
    status: "confirmed",
  },
];

// Mock data for earnings stats
const EARNINGS_STATS = {
  thisMonth: 2450,
  pendingJobs: 3,
  totalJobs: 48,
  averageRating: 4.8,
  currency: "EUR",
};

// Quick Actions
const QUICK_ACTIONS = [
  {
    icon: "wallet-outline" as const,
    title: "Earnings",
    route: "/(tabs)/translator/earnings" as const,
    color: "#0066CC",
  },
  {
    icon: "chatbubble-outline" as const,
    title: "Messages",
    route: "/(tabs)/translator/chat" as const,
    color: "#28A745",
  },
  {
    icon: "person-outline" as const,
    title: "Profile",
    route: "/(tabs)/translator/profile" as const,
    color: "#6C757D",
  },
];

export default function TranslatorDashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
  };

  return (
    <ScrollView
      className="flex-1 bg-neutral-gray-100"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={["#0066CC", "#0052A3"]}
        className="px-5 pt-12 pb-6 rounded-b-3xl"
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-white text-lg opacity-80">
              {t("dashboard.welcome")}
              {user?.name ? `, ${user.name.split(" ")[0]}!` : "!"}
            </Text>
            <Text className="text-white text-2xl font-bold mt-1">
              {t("dashboard.dashboard")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={toggleAvailability}
            className={`px-4 py-2 rounded-full ${
              isAvailable ? "bg-green-500" : "bg-neutral-gray-400"
            }`}
          >
            <Text className="text-white font-medium">
              {isAvailable ? "Available" : "Unavailable"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Earnings Preview */}
        <View className="bg-white bg-opacity-10 rounded-xl p-4">
          <Text className="text-white text-sm opacity-80">
            {t("dashboard.earningsThisMonth")}
          </Text>
          <Text className="text-white text-3xl font-bold mt-1">
            €{EARNINGS_STATS.thisMonth}
          </Text>
          <View className="flex-row mt-2">
            <View className="bg-white bg-opacity-20 px-3 py-1 rounded-full mr-2">
              <Text className="text-white text-xs">
                {EARNINGS_STATS.pendingJobs} pending jobs
              </Text>
            </View>
            <View className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <Text className="text-white text-xs">
                {EARNINGS_STATS.totalJobs} total jobs
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View className="flex-row justify-between mx-4 mt-[-30]">
        {QUICK_ACTIONS.map((action, index) => (
          <TouchableOpacity
            key={index}
            className="bg-white rounded-xl shadow-sm p-4 w-[80]"
            onPress={() => router.push(action.route)}
          >
            <View
              className="w-10 h-10 rounded-full mb-2 items-center justify-center"
              style={{ backgroundColor: `${action.color}20` }}
            >
              <Ionicons name={action.icon} size={20} color={action.color} />
            </View>
            <Text className="text-xs text-neutral-gray-600">{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Today's Overview */}
      <View className="mx-4 mt-6">
        <Text className="text-lg font-bold text-neutral-gray-800 mb-3">
          {t("dashboard.todayOverview")}
        </Text>
        <View className="bg-white rounded-xl shadow-sm p-4">
          <View className="flex-row justify-between mb-4">
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-primary">
                {EARNINGS_STATS.pendingJobs}
              </Text>
              <Text className="text-xs text-neutral-gray-600">Pending Jobs</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-success">
                {EARNINGS_STATS.averageRating}
              </Text>
              <Text className="text-xs text-neutral-gray-600">Avg Rating</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-warning">
                {EARNINGS_STATS.totalJobs}
              </Text>
              <Text className="text-xs text-neutral-gray-600">Total Jobs</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Weekly Stats */}
      <View className="mx-4 mt-6">
        <Text className="text-lg font-bold text-neutral-gray-800 mb-3">
          {t("dashboard.weeklyStats")}
        </Text>
        <View className="bg-white rounded-xl shadow-sm p-4">
          {/* Add weekly stats visualization here */}
        </View>
      </View>

      {/* Upcoming Bookings */}
      <View className="mx-4 mt-6 mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-neutral-gray-800">
            {t("dashboard.upcomingBookings")}
          </Text>
          <TouchableOpacity>
            <Text className="text-primary">See All</Text>
          </TouchableOpacity>
        </View>

        {MOCK_BOOKINGS.map((booking) => (
          <View
            key={booking.id}
            className="bg-white rounded-xl shadow-sm p-4 mb-3"
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base font-medium text-neutral-gray-800">
                {booking.travelerName}
              </Text>
              <View
                className={`px-2 py-1 rounded-full ${
                  booking.status === "confirmed"
                    ? "bg-success bg-opacity-20"
                    : "bg-warning bg-opacity-20"
                }`}
              >
                <Text
                  className={`text-xs ${
                    booking.status === "confirmed"
                      ? "text-success"
                      : "text-warning"
                  }`}
                >
                  {booking.status}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-2">
              <Ionicons name="location-outline" size={16} color="#6C757D" />
              <Text className="text-sm text-neutral-gray-600 ml-1">
                {booking.location}
              </Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Ionicons name="time-outline" size={16} color="#6C757D" />
              <Text className="text-sm text-neutral-gray-600 ml-1">
                {booking.date} at {booking.time} ({booking.duration}h)
              </Text>
            </View>

            <View className="flex-row justify-between items-center pt-2 border-t border-neutral-gray-200">
              <Text className="text-primary font-bold">
                €{booking.amount}
              </Text>
              <View className="flex-row">
                {booking.status === "pending" && (
                  <>
                    <TouchableOpacity className="bg-success px-4 py-2 rounded-full mr-2">
                      <Text className="text-white font-medium">Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-error px-4 py-2 rounded-full">
                      <Text className="text-white font-medium">Decline</Text>
                    </TouchableOpacity>
                  </>
                )}
                {booking.status === "confirmed" && (
                  <TouchableOpacity className="bg-primary px-4 py-2 rounded-full">
                    <Text className="text-white font-medium">View Details</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
} 