import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { getBookings, updateBooking, Booking } from "../../../services/api";

export default function RequestsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "upcoming" | "past">("pending");
  const [requests, setRequests] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch requests based on tab
  const fetchRequests = async (tab: "pending" | "upcoming" | "past") => {
    try {
      setError(null);
      
      // Map the tab to appropriate status for API
      let statusParam: string;
      switch (tab) {
        case "pending":
          statusParam = "pending"; // Custom status for pending requests
          break;
        case "upcoming":
          statusParam = "upcoming"; // Already exists in API
          break;
        case "past":
          statusParam = "past"; // Already exists in API
          break;
        default:
          statusParam = "";
      }
      
      // Fetch bookings from API
      const bookingsData = await getBookings(statusParam);
      
      // For pending tab, filter to only show pending status
      // For upcoming tab, filter to only show confirmed status
      const filteredData = bookingsData.filter(booking => {
        if (tab === "pending") {
          return booking.status === "pending";
        } else if (tab === "upcoming") {
          return booking.status === "confirmed";
        } else if (tab === "past") {
          // Past tab already returns past bookings
          return true;
        }
        return false;
      });
      
      setRequests(filteredData);
      return filteredData;
    } catch (err) {
      console.error(`Error fetching ${tab} requests:`, err);
      setError(`Failed to load ${tab} requests. Please try again.`);
      return [];
    }
  };

  // Initial fetch
  useEffect(() => {
    const loadRequests = async () => {
      setLoading(true);
      await fetchRequests(activeTab);
      setLoading(false);
    };
    loadRequests();
  }, []);

  // Fetch when tab changes
  useEffect(() => {
    const loadRequests = async () => {
      setLoading(true);
      await fetchRequests(activeTab);
      setLoading(false);
    };
    loadRequests();
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests(activeTab);
    setRefreshing(false);
  };

  const handleAccept = (bookingId: string) => {
    Alert.alert(
      "Accept Request",
      "Are you sure you want to accept this translation request?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Accept",
          onPress: async () => {
            try {
              setLoading(true);
              // Update booking status to confirmed
              await updateBooking(bookingId, { action: "reschedule" });
              Alert.alert("Success", "Request accepted successfully!");
              // Refresh the requests list
              await fetchRequests(activeTab);
            } catch (error) {
              console.error("Error accepting request:", error);
              Alert.alert("Error", "Failed to accept request. Please try again.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDecline = (bookingId: string) => {
    Alert.alert(
      "Decline Request",
      "Are you sure you want to decline this translation request?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              // Update booking status to cancelled
              await updateBooking(bookingId, { action: "cancel" });
              Alert.alert("Success", "Request declined successfully.");
              // Refresh the requests list
              await fetchRequests(activeTab);
            } catch (error) {
              console.error("Error declining request:", error);
              Alert.alert("Error", "Failed to decline request. Please try again.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Helper function to get language names from booking
  const getLanguagesFromBooking = (booking: Booking): string[] => {
    // This is a mock implementation - in a real app you would extract 
    // languages from the booking or related traveler profile
    return ["English", "French"]; 
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4">
        <Text className="text-2xl font-bold text-gray-900">Requests</Text>
        <Text className="text-gray-600 mt-1">Manage your translation requests</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-200">
        {(["pending", "upcoming", "past"] as const).map((tab) => (
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

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text className="mt-4 text-gray-600">Loading requests...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text className="mt-4 text-gray-900 font-semibold text-center">{error}</Text>
          <TouchableOpacity 
            className="mt-6 bg-blue-600 px-4 py-2 rounded-full"
            onPress={onRefresh}
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="p-4">
            {requests.length > 0 ? (
              requests.map((request) => (
                <View
                  key={request.id}
                  className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View>
                      <Text className="text-lg font-semibold text-gray-900">
                        {request.other_user_name}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                        <Text className="text-gray-600 ml-1">
                          {request.formatted_date}, {request.formatted_time}
                        </Text>
                      </View>
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="location-outline" size={14} color="#6B7280" />
                        <Text className="text-gray-600 ml-1">{request.location}</Text>
                      </View>
                    </View>
                    <Text className="text-lg font-bold text-blue-600">
                      €{request.amount}
                    </Text>
                  </View>

                  <View className="flex-row items-center mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="time" size={14} color="#6B7280" />
                      <Text className="text-gray-600 ml-1">{request.duration_hours} hours</Text>
                    </View>
                    <View className="flex-row items-center ml-4">
                      <MaterialCommunityIcons name="translate" size={14} color="#6B7280" />
                      <Text className="text-gray-600 ml-1">
                        {getLanguagesFromBooking(request).join(", ")}
                      </Text>
                    </View>
                  </View>

                  {request.notes && (
                    <View className="bg-gray-50 rounded-xl p-3 mb-3">
                      <Text className="text-gray-600">{request.notes}</Text>
                    </View>
                  )}

                  {request.status === "pending" && (
                    <View className="flex-row justify-end space-x-3">
                      <TouchableOpacity
                        className="bg-red-50 px-4 py-2 rounded-full"
                        onPress={() => handleDecline(request.id)}
                      >
                        <Text className="text-red-600 font-medium">Decline</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-blue-600 px-4 py-2 rounded-full"
                        onPress={() => handleAccept(request.id)}
                      >
                        <Text className="text-white font-medium">Accept</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {request.status === "confirmed" && (
                    <View className="flex-row justify-end">
                      <TouchableOpacity
                        className="bg-blue-50 px-4 py-2 rounded-full"
                        onPress={() => router.push(`/(translator)/chat/${request.other_user_id}`)}
                      >
                        <Text className="text-blue-600 font-medium">Message Traveler</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View className="items-center justify-center py-12">
                <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-4">
                  <Ionicons name="calendar-outline" size={32} color="#1a73e8" />
                </View>
                <Text className="text-lg font-semibold text-gray-900 mb-2">
                  No {activeTab} requests
                </Text>
                <Text className="text-gray-600 text-center">
                  {activeTab === "pending"
                    ? "You don't have any pending requests at the moment."
                    : activeTab === "upcoming"
                    ? "You don't have any upcoming sessions."
                    : "You don't have any past sessions yet."}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
