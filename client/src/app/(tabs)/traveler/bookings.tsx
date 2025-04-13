import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

interface Booking {
  id: string;
  translatorName: string;
  translatorPhoto: string;
  date: string;
  time: string;
  location: string;
  status: "upcoming" | "completed" | "cancelled";
  amount: number;
}

export default function BookingsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  // Mock data for bookings
  const bookings: Booking[] = [
    {
      id: "1",
      translatorName: "Sarah Martin",
      translatorPhoto: "https://placekitten.com/200/200",
      date: "Tomorrow",
      time: "14:00 - 16:00",
      location: "Eiffel Tower",
      status: "upcoming",
      amount: 90,
    },
    {
      id: "2",
      translatorName: "Jean Dupont",
      translatorPhoto: "https://placekitten.com/201/201",
      date: "Jun 25",
      time: "10:00 - 12:00",
      location: "Louvre Museum",
      status: "upcoming",
      amount: 80,
    },
    {
      id: "3",
      translatorName: "Maria Garcia",
      translatorPhoto: "https://placekitten.com/202/202",
      date: "Jun 15",
      time: "15:30 - 17:30",
      location: "Notre-Dame",
      status: "completed",
      amount: 85,
    },
    {
      id: "4",
      translatorName: "David Chen",
      translatorPhoto: "https://placekitten.com/203/203",
      date: "Jun 10",
      time: "09:00 - 11:00",
      location: "Montmartre",
      status: "cancelled",
      amount: 75,
    },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1500);
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
          onPress: () => {
            // Handle cancellation
            Alert.alert("Booking Cancelled", "Your booking has been cancelled successfully");
          },
        },
      ]
    );
  };

  const handleReschedule = (bookingId: string) => {
    // Navigate to reschedule screen
    Alert.alert("Reschedule", "Reschedule functionality not implemented yet");
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === "upcoming") {
      return booking.status === "upcoming";
    } else {
      return booking.status === "completed" || booking.status === "cancelled";
    }
  });

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
        <View className="p-4">
          {filteredBookings.map((booking) => (
            <View
              key={booking.id}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
            >
              <View className="flex-row items-center">
                <Image
                  source={{ uri: booking.translatorPhoto }}
                  className="w-16 h-16 rounded-xl"
                />
                <View className="flex-1 ml-4">
                  <Text className="text-lg font-semibold text-gray-900">
                    {booking.translatorName}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <Text className="text-gray-600 ml-1">
                      {booking.date}, {booking.time}
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

              {booking.status === "upcoming" && (
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
                    onPress={() => router.push(`/chat/${booking.id}`)}
                  >
                    <Text className="text-white font-medium">Message</Text>
                  </TouchableOpacity>
                </View>
              )}

              {booking.status === "completed" && (
                <View className="flex-row justify-end mt-4">
                  <TouchableOpacity
                    className="bg-blue-600 px-4 py-2 rounded-full"
                    onPress={() => router.push(`/review/${booking.id}`)}
                  >
                    <Text className="text-white font-medium">Leave Review</Text>
                  </TouchableOpacity>
                </View>
              )}

              {booking.status === "cancelled" && (
                <View className="bg-red-50 rounded-lg px-3 py-2 mt-4">
                  <Text className="text-red-600 text-center">Cancelled</Text>
                </View>
              )}
            </View>
          ))}

          {filteredBookings.length === 0 && (
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
      </ScrollView>
    </View>
  );
}
