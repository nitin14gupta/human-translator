import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

interface RequestData {
  id: string;
  travelerName: string;
  date: string;
  time: string;
  location: string;
  status: "pending" | "accepted" | "declined";
  amount: number;
  duration: string;
  languages: string[];
  notes?: string;
}

export default function RequestsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "upcoming" | "past">("pending");

  // Mock data for requests
  const [requests, setRequests] = useState<RequestData[]>([
    {
      id: "1",
      travelerName: "John Smith",
      date: "Tomorrow",
      time: "14:00 - 16:00",
      location: "Eiffel Tower",
      status: "pending",
      amount: 120,
      duration: "2 hours",
      languages: ["English", "French"],
      notes: "First time in Paris, interested in historical facts",
    },
    {
      id: "2",
      travelerName: "Maria Garcia",
      date: "Jun 24",
      time: "10:00 - 12:00",
      location: "Louvre Museum",
      status: "pending",
      amount: 90,
      duration: "2 hours",
      languages: ["Spanish", "French"],
      notes: "Art history enthusiast",
    },
    {
      id: "3",
      travelerName: "David Chen",
      date: "Jun 25",
      time: "15:30 - 17:30",
      location: "Notre-Dame",
      status: "accepted",
      amount: 100,
      duration: "2 hours",
      languages: ["Chinese", "English"],
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleAccept = (requestId: string) => {
    Alert.alert(
      "Accept Request",
      "Are you sure you want to accept this request?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Accept",
          onPress: () => {
            setRequests(requests.map(request =>
              request.id === requestId
                ? { ...request, status: "accepted" }
                : request
            ));
          },
        },
      ]
    );
  };

  const handleDecline = (requestId: string) => {
    Alert.alert(
      "Decline Request",
      "Are you sure you want to decline this request?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Decline",
          style: "destructive",
          onPress: () => {
            setRequests(requests.map(request =>
              request.id === requestId
                ? { ...request, status: "declined" }
                : request
            ));
          },
        },
      ]
    );
  };

  const filteredRequests = requests.filter(request => {
    switch (activeTab) {
      case "pending":
        return request.status === "pending";
      case "upcoming":
        return request.status === "accepted";
      case "past":
        return false; // Add logic for past requests
      default:
        return true;
    }
  });

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

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          {filteredRequests.map((request) => (
            <View
              key={request.id}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View>
                  <Text className="text-lg font-semibold text-gray-900">
                    {request.travelerName}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <Text className="text-gray-600 ml-1">
                      {request.date}, {request.time}
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
                  <Text className="text-gray-600 ml-1">{request.duration}</Text>
                </View>
                <View className="flex-row items-center ml-4">
                  <MaterialCommunityIcons name="translate" size={14} color="#6B7280" />
                  <Text className="text-gray-600 ml-1">
                    {request.languages.join(", ")}
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

              {request.status === "accepted" && (
                <View className="flex-row justify-end">
                  <TouchableOpacity
                    className="bg-blue-50 px-4 py-2 rounded-full"
                    onPress={() => router.push(`/translator/chat/${request.id}`)}
                  >
                    <Text className="text-blue-600 font-medium">Message Traveler</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {filteredRequests.length === 0 && (
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
    </View>
  );
}
