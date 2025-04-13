import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import { StatusBar } from "expo-status-bar";

interface BookingData {
  id: string;
  travelerName: string;
  date: string;
  time: string;
  location: string;
  status: "upcoming" | "completed" | "cancelled";
  amount: number;
}

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for earnings chart
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      data: [65, 85, 110, 75, 95, 120, 80],
    }],
  };

  // Mock data for upcoming bookings
  const upcomingBookings: BookingData[] = [
    {
      id: "1",
      travelerName: "John Smith",
      date: "Today",
      time: "14:00 - 16:00",
      location: "Eiffel Tower",
      status: "upcoming",
      amount: 120,
    },
    {
      id: "2",
      travelerName: "Maria Garcia",
      date: "Tomorrow",
      time: "10:00 - 12:00",
      location: "Louvre Museum",
      status: "upcoming",
      amount: 90,
    },
    {
      id: "3",
      travelerName: "David Chen",
      date: "23 Jun",
      time: "15:30 - 17:30",
      location: "Notre-Dame",
      status: "upcoming",
      amount: 100,
    },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4">
        <Text className="text-2xl font-bold text-gray-900">Welcome Back!</Text>
        <Text className="text-gray-600 mt-1">Here's your dashboard overview</Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Stats */}
        <View className="flex-row px-4 py-4">
          <View className="flex-1 bg-white rounded-2xl p-4 mr-2 shadow-sm">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
                <Ionicons name="wallet" size={18} color="#1a73e8" />
              </View>
              <Text className="text-gray-600 ml-2">Today's Earnings</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">€120</Text>
          </View>

          <View className="flex-1 bg-white rounded-2xl p-4 ml-2 shadow-sm">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center">
                <Ionicons name="calendar" size={18} color="#15803d" />
              </View>
              <Text className="text-gray-600 ml-2">Today's Sessions</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">2</Text>
          </View>
        </View>

        {/* Earnings Chart */}
        <View className="bg-white mx-4 rounded-2xl p-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">Weekly Earnings</Text>
            <TouchableOpacity 
              className="bg-blue-50 px-3 py-1 rounded-full"
              onPress={() => router.push("/translator/earnings")}
            >
              <Text className="text-blue-600">See Details</Text>
            </TouchableOpacity>
          </View>

          <LineChart
            data={chartData}
            width={Platform.OS === 'web' ? 500 : 320}
            height={220}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(26, 115, 232, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#1a73e8"
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </View>

        {/* Upcoming Bookings */}
        <View className="mx-4 mt-4 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">Upcoming Sessions</Text>
            <TouchableOpacity 
              className="bg-blue-50 px-3 py-1 rounded-full"
              onPress={() => router.push("/translator/requests")}
            >
              <Text className="text-blue-600">View All</Text>
            </TouchableOpacity>
          </View>

          {upcomingBookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
              onPress={() => router.push(`/translator/requests/${booking.id}`)}
            >
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-base font-semibold text-gray-900">
                    {booking.travelerName}
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
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Quick Actions */}
      <View className="bg-white border-t border-gray-200 px-4 py-4">
        <View className="flex-row justify-around">
          <TouchableOpacity 
            className="items-center"
            onPress={() => router.push("/translator/requests")}
          >
            <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-1">
              <Ionicons name="calendar" size={24} color="#1a73e8" />
            </View>
            <Text className="text-sm text-gray-600">New Request</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="items-center"
            onPress={() => router.push("/translator/chat")}
          >
            <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-1">
              <Ionicons name="chatbubbles" size={24} color="#1a73e8" />
            </View>
            <Text className="text-sm text-gray-600">Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="items-center"
            onPress={() => router.push("/translator/earnings")}
          >
            <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-1">
              <Ionicons name="wallet" size={24} color="#1a73e8" />
            </View>
            <Text className="text-sm text-gray-600">Earnings</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="items-center"
            onPress={() => router.push("/translator/profile")}
          >
            <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-1">
              <Ionicons name="settings" size={24} color="#1a73e8" />
            </View>
            <Text className="text-sm text-gray-600">Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
