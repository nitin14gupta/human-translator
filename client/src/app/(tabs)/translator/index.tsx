import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import { StatusBar } from "expo-status-bar";
import { getBookings, Booking, getPaymentHistory } from "../../../services/api";

interface DashboardStats {
  todayEarnings: number;
  todaySessions: number;
  weeklyEarnings: number[];
  weeklyLabels: string[];
}

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayEarnings: 0,
    todaySessions: 0,
    weeklyEarnings: [0, 0, 0, 0, 0, 0, 0],
    weeklyLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  });
  const [error, setError] = useState<string | null>(null);

  // Function to fetch data for the dashboard
  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Fetch upcoming bookings
      const bookingsData = await getBookings("upcoming");
      setUpcomingBookings(bookingsData.slice(0, 3)); // Show only the first 3
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Today's sessions count
      const todaySessions = bookingsData.filter(booking => 
        booking.date === today && booking.status === "confirmed"
      ).length;
      
      // Today's earnings (from confirmed bookings today)
      const todayEarnings = bookingsData
        .filter(booking => booking.date === today && booking.status === "confirmed")
        .reduce((sum, booking) => sum + booking.amount, 0);
      
      // Try to get payment history for more accurate earnings data
      try {
        const payments = await getPaymentHistory();
        // Process payments data if needed
      } catch (paymentError) {
        console.error("Error fetching payment history:", paymentError);
        // Continue with bookings data only
      }
      
      // Mock weekly data for now - in a real app, you would calculate this from actual data
      const weeklyEarnings = [65, 85, 110, 75, 95, 120, 80];
      
      setStats({
        todayEarnings,
        todaySessions,
        weeklyEarnings,
        weeklyLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      });
      
      return { bookingsData };
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      return null;
    }
  };

  // Initial data load
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Prepare chart data
  const chartData = {
    labels: stats.weeklyLabels,
    datasets: [{
      data: stats.weeklyEarnings,
    }],
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4">
        <Text className="text-2xl font-bold text-gray-900">Welcome Back!</Text>
        <Text className="text-gray-600 mt-1">Here's your dashboard overview</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text className="mt-4 text-gray-600">Loading dashboard data...</Text>
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
          {/* Quick Stats */}
          <View className="flex-row px-4 py-4">
            <View className="flex-1 bg-white rounded-2xl p-4 mr-2 shadow-sm">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
                  <Ionicons name="wallet" size={18} color="#1a73e8" />
                </View>
                <Text className="text-gray-600 ml-2">Today's Earnings</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900">€{stats.todayEarnings}</Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-4 ml-2 shadow-sm">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center">
                  <Ionicons name="calendar" size={18} color="#15803d" />
                </View>
                <Text className="text-gray-600 ml-2">Today's Sessions</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900">{stats.todaySessions}</Text>
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

            {upcomingBookings.length === 0 ? (
              <View className="bg-white rounded-2xl p-6 items-center justify-center shadow-sm">
                <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
                <Text className="text-lg font-semibold text-gray-900 mt-4">No upcoming sessions</Text>
                <Text className="text-gray-600 text-center mt-2">
                  Your upcoming translation sessions will appear here.
                </Text>
              </View>
            ) : (
              upcomingBookings.map((booking) => (
                <TouchableOpacity
                  key={booking.id}
                  className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
                  onPress={() => router.push(`/translator/requests/${booking.id}`)}
                >
                  <View className="flex-row justify-between items-start">
                    <View>
                      <Text className="text-base font-semibold text-gray-900">
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
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      )}

    </View>
  );
}
