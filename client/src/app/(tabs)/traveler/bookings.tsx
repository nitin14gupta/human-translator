import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { getBookings, updateBooking, Booking } from "../../../services/api";

export default function BookingsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async (tab: "upcoming" | "past") => {
    try {
      setError(null);
      const status = tab === "upcoming" ? "upcoming" : "past";
      const data = await getBookings(status);
      setBookings(data);
      return data;
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Please try again.");
      return [];
    }
  };

  // Initial fetch
  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      await fetchBookings(activeTab);
      setLoading(false);
    };
    loadBookings();
  }, []);

  // Fetch when tab changes
  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      await fetchBookings(activeTab);
      setLoading(false);
    };
    loadBookings();
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings(activeTab);
    setRefreshing(false);
  };

  const handleCancel = (bookingId: string) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await updateBooking(bookingId, { action: "cancel" });
              Alert.alert("Success", "Your booking has been cancelled successfully");
              // Refresh bookings list
              await fetchBookings(activeTab);
            } catch (error) {
              console.error("Error cancelling booking:", error);
              Alert.alert("Error", "Failed to cancel booking. Please try again.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReschedule = (bookingId: string) => {
    // Navigate to reschedule screen
    router.push(`/booking/reschedule/${bookingId}`);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "confirmed":
        return "Confirmed";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-600";
      case "confirmed":
        return "bg-green-50 text-green-600";
      case "completed":
        return "bg-blue-50 text-blue-600";
      case "cancelled":
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4">
        <Text className="text-2xl font-bold text-gray-900">My Bookings</Text>
        <Text className="text-gray-600 mt-1">Manage your translation sessions</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-200">
        {(["upcoming", "past"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-4 ${
              activeTab === tab
                ? "border-b-2 border-blue-600"
                : ""
            }`}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              className={`text-center font-medium ${
                activeTab === tab
                  ? "text-blue-600"
                  : "text-gray-600"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#1a73e8" />
            <Text className="text-gray-600 mt-4">Loading bookings...</Text>
          </View>
        ) : error ? (
          <View className="items-center justify-center py-12">
            <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
              <Ionicons name="alert-circle-outline" size={32} color="#e53e3e" />
            </View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Bookings
            </Text>
            <Text className="text-gray-600 text-center mx-8">{error}</Text>
            <TouchableOpacity
              className="mt-4 bg-blue-600 px-4 py-2 rounded-full"
              onPress={onRefresh}
            >
              <Text className="text-white font-medium">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="p-4">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <View
                  key={booking.id}
                  className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
                >
                  <View className="flex-row items-center">
                    <Image
                      source={{ uri: booking.other_user_photo || "https://placekitten.com/200/200" }}
                      className="w-16 h-16 rounded-xl"
                    />
                    <View className="flex-1 ml-4">
                      <Text className="text-lg font-semibold text-gray-900">
                        {booking.other_user_name}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                        <Text className="text-gray-600 ml-1">
                          {booking.formatted_date}, {booking.formatted_time}
                        </Text>
                      </View>
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="location-outline" size={14} color="#6B7280" />
                        <Text className="text-gray-600 ml-1">{booking.location}</Text>
                      </View>
                    </View>
                    <Text className="text-lg font-bold text-blue-600">
                      €{booking.amount}
                    </Text>
                  </View>

                  {/* Status Badge */}
                  <View className="mt-3">
                    <View className={`self-start px-3 py-1 rounded-full ${getStatusColor(booking.status).split(' ')[0]}`}>
                      <Text className={getStatusColor(booking.status).split(' ')[1]}>
                        {getStatusLabel(booking.status)}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  {booking.status === "pending" || booking.status === "confirmed" ? (
                    <View className="flex-row justify-end space-x-3 mt-4">
                      <TouchableOpacity
                        className="bg-red-50 px-4 py-2 rounded-full"
                        onPress={() => handleCancel(booking.id)}
                      >
                        <Text className="text-red-600 font-medium">Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-blue-50 px-4 py-2 rounded-full"
                        onPress={() => handleReschedule(booking.id)}
                      >
                        <Text className="text-blue-600 font-medium">Reschedule</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-blue-600 px-4 py-2 rounded-full"
                        onPress={() => router.push(`/(traveler)/${booking.other_user_id}`)}
                      >
                        <Text className="text-white font-medium">Message</Text>
                      </TouchableOpacity>
                    </View>
                  ) : booking.status === "completed" ? (
                    <View className="flex-row justify-end mt-4">
                      <TouchableOpacity
                        className="bg-blue-600 px-4 py-2 rounded-full"
                        onPress={() => router.push(`/review/${booking.id}`)}
                      >
                        <Text className="text-white font-medium">Leave Review</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              ))
            ) : (
              <View className="items-center justify-center py-12">
                <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-4">
                  <Ionicons name="calendar-outline" size={32} color="#1a73e8" />
                </View>
                <Text className="text-lg font-semibold text-gray-900 mb-2">
                  No {activeTab} bookings
                </Text>
                <Text className="text-gray-600 text-center">
                  {activeTab === "upcoming"
                    ? "You don't have any upcoming sessions."
                    : "You don't have any past sessions yet."}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
