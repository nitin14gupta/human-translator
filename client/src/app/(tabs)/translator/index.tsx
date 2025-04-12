import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

// Mock data for demonstration
const mockUpcomingBookings = [
  {
    id: 1,
    travelerName: "John Smith",
    date: "Today, 2:30 PM",
    duration: 2,
    status: "confirmed",
    languages: ["English", "Japanese"],
  },
  {
    id: 2,
    travelerName: "Maria Garcia",
    date: "Tomorrow, 10:00 AM",
    duration: 3,
    status: "pending",
    languages: ["English", "Spanish"],
  },
  {
    id: 3,
    travelerName: "Wei Zhang",
    date: "May 25, 9:00 AM",
    duration: 4,
    status: "confirmed",
    languages: ["English", "Chinese"],
  },
];

export default function TranslatorDashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(true);

  // Earnings stats
  const earningsStats = {
    thisMonth: 1240,
    lastMonth: 980,
    pending: 350,
    totalJobs: 42,
    avgRating: 4.8,
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const toggleAvailability = () => {
    setAvailabilityStatus(!availabilityStatus);
  };

  return (
    <ScrollView
      className="flex-1 bg-neutral-gray-100"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Dashboard Header with Availability Toggle */}
      <LinearGradient
        colors={["#007BFF", "#0056b3"]}
        className="px-5 pt-4 pb-6 rounded-b-3xl"
      >
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-lg font-medium">
            {t("dashboard.welcome")}
            {user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </Text>
          <TouchableOpacity
            onPress={toggleAvailability}
            className={`py-1 px-3 rounded-full ${
              availabilityStatus
                ? "bg-success bg-opacity-20"
                : "bg-neutral-gray-700 bg-opacity-30"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                availabilityStatus ? "text-white" : "text-neutral-gray-300"
              }`}
            >
              {availabilityStatus ? "Available" : "Unavailable"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Earnings Preview */}
        <View className="mt-4 bg-white bg-opacity-15 p-4 rounded-xl">
          <View className="flex-row justify-between items-center">
            <Text className="text-white text-opacity-90 text-base font-medium">
              {t("dashboard.earnings")}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/translator/earnings")}
              className="flex-row items-center"
            >
              <Text className="text-white text-opacity-80 text-sm mr-1">
                {t("common.details")}
              </Text>
              <Ionicons name="chevron-forward" size={14} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-white text-3xl font-bold mt-2">
            ${earningsStats.thisMonth}
          </Text>
          <Text className="text-white text-opacity-80 text-sm">
            {t("dashboard.thisMonth")}
          </Text>

          <View className="flex-row justify-between mt-4">
            <View className="items-center">
              <Text className="text-white text-opacity-90 text-sm">
                {t("dashboard.pending")}
              </Text>
              <Text className="text-white font-bold mt-1">
                ${earningsStats.pending}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-opacity-90 text-sm">
                {t("dashboard.jobs")}
              </Text>
              <Text className="text-white font-bold mt-1">
                {earningsStats.totalJobs}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-opacity-90 text-sm">
                {t("dashboard.rating")}
              </Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-white font-bold">
                  {earningsStats.avgRating}
                </Text>
                <Ionicons
                  name="star"
                  size={12}
                  color="white"
                  style={{ marginLeft: 2 }}
                />
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View className="flex-row justify-between mx-4 -mt-5">
        <TouchableOpacity className="bg-white rounded-xl shadow-sm p-3 flex-1 mr-3 items-center">
          <View className="bg-primary bg-opacity-10 rounded-full p-2 mb-2">
            <Ionicons name="calendar-outline" size={24} color="#007BFF" />
          </View>
          <Text className="text-sm font-medium text-neutral-gray-800">
            {t("dashboard.manageSchedule")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white rounded-xl shadow-sm p-3 flex-1 items-center">
          <View className="bg-primary bg-opacity-10 rounded-full p-2 mb-2">
            <Ionicons name="cash-outline" size={24} color="#007BFF" />
          </View>
          <Text className="text-sm font-medium text-neutral-gray-800">
            {t("dashboard.withdrawal")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Today's Overview */}
      <View className="mx-4 mt-6">
        <Text className="text-lg font-bold text-neutral-gray-800 mb-3">
          {t("dashboard.todayOverview")}
        </Text>
        <View className="flex-row">
          <View className="bg-white rounded-xl shadow-sm p-4 flex-1 mr-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-neutral-gray-600">
                {t("dashboard.upcomingBookings")}
              </Text>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={20}
                color="#007BFF"
              />
            </View>
            <Text className="text-2xl font-bold text-neutral-gray-800 mt-1">
              {
                mockUpcomingBookings.filter(
                  (booking) => booking.date.includes("Today")
                ).length
              }
            </Text>
          </View>

          <View className="bg-white rounded-xl shadow-sm p-4 flex-1">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-neutral-gray-600">
                {t("dashboard.requests")}
              </Text>
              <Ionicons name="notifications-outline" size={20} color="#FF8800" />
            </View>
            <Text className="text-2xl font-bold text-neutral-gray-800 mt-1">
              {
                mockUpcomingBookings.filter(
                  (booking) => booking.status === "pending"
                ).length
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Weekly Stats */}
      <View className="mx-4 mt-6">
        <Text className="text-lg font-bold text-neutral-gray-800 mb-3">
          {t("dashboard.weeklyStats")}
        </Text>
        <View className="bg-white rounded-xl shadow-sm p-4">
          <View className="flex-row justify-between items-center mb-6">
            <View className="items-center">
              <Text className="text-sm text-neutral-gray-600 mb-1">
                {t("dashboard.earnings")}
              </Text>
              <Text className="text-lg font-bold text-neutral-gray-800">
                $340
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-sm text-neutral-gray-600 mb-1">
                {t("dashboard.jobs")}
              </Text>
              <Text className="text-lg font-bold text-neutral-gray-800">12</Text>
            </View>
            <View className="items-center">
              <Text className="text-sm text-neutral-gray-600 mb-1">
                {t("dashboard.hours")}
              </Text>
              <Text className="text-lg font-bold text-neutral-gray-800">24</Text>
            </View>
          </View>

          {/* Simplified Chart (Visual Representation) */}
          <View className="h-20 flex-row items-end justify-between mt-2">
            {[40, 65, 30, 80, 55, 45, 60].map((height, index) => (
              <View key={index} className="flex-1 items-center">
                <View
                  className="bg-primary rounded-t-md"
                  style={{ height: height, maxHeight: 80 }}
                />
                <Text className="text-xs text-neutral-gray-600 mt-1">
                  {["M", "T", "W", "T", "F", "S", "S"][index]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Upcoming Bookings */}
      <View className="mx-4 mt-6 mb-8">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-neutral-gray-800">
            {t("dashboard.upcomingBookings")}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/translator/requests")}
          >
            <Text className="text-primary">See All</Text>
          </TouchableOpacity>
        </View>

        {mockUpcomingBookings.map((booking) => (
          <TouchableOpacity
            key={booking.id}
            className="bg-white rounded-xl shadow-sm p-4 mb-3"
          >
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-semibold text-neutral-gray-800">
                {booking.travelerName}
              </Text>
              <View
                className={`py-1 px-2 rounded-full ${
                  booking.status === "confirmed"
                    ? "bg-success bg-opacity-10"
                    : "bg-warning bg-opacity-10"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    booking.status === "confirmed"
                      ? "text-success"
                      : "text-warning"
                  }`}
                >
                  {booking.status === "confirmed" ? "Confirmed" : "Pending"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mt-2">
              <Ionicons name="time-outline" size={16} color="#6C757D" />
              <Text className="text-sm text-neutral-gray-600 ml-1">
                {booking.date} • {booking.duration} hours
              </Text>
            </View>

            <View className="flex-row items-center mt-1">
              <Ionicons name="language-outline" size={16} color="#6C757D" />
              <Text className="text-sm text-neutral-gray-600 ml-1">
                {booking.languages.join(" → ")}
              </Text>
            </View>

            <View className="flex-row justify-between mt-3 pt-2 border-t border-neutral-gray-200">
              <TouchableOpacity className="flex-row items-center">
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color="#007BFF"
                />
                <Text className="ml-1 text-sm text-primary">
                  {booking.status === "pending" ? "Accept" : "View Details"}
                </Text>
              </TouchableOpacity>

              {booking.status === "pending" && (
                <TouchableOpacity className="flex-row items-center">
                  <Ionicons name="close-circle-outline" size={16} color="red" />
                  <Text className="ml-1 text-sm text-error">Decline</Text>
                </TouchableOpacity>
              )}

              {booking.status === "confirmed" && (
                <TouchableOpacity className="flex-row items-center">
                  <Ionicons
                    name="chatbubble-outline"
                    size={16}
                    color="#007BFF"
                  />
                  <Text className="ml-1 text-sm text-primary">Message</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statusLeft: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f7ff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 5,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  locationUpdate: {
    marginLeft: "auto",
  },
  locationUpdateText: {
    color: "#007BFF",
    fontSize: 14,
    fontWeight: "500",
  },
  summaryCard: {
    backgroundColor: "white",
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007BFF",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
  },
  summaryDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#eee",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 15,
    marginBottom: 10,
  },
  requestCard: {
    backgroundColor: "white",
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  travelerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  urgentBadge: {
    backgroundColor: "#f8d7da",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  urgentText: {
    color: "#dc3545",
    fontSize: 12,
    fontWeight: "500",
  },
  requestDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  requestDetailText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 6,
    flex: 1,
  },
  distanceText: {
    fontSize: 14,
    color: "#007BFF",
    fontWeight: "500",
  },
  requestActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#007BFF",
    marginRight: 5,
  },
  acceptButtonText: {
    color: "white",
    fontWeight: "500",
  },
  declineButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
    marginLeft: 5,
  },
  declineButtonText: {
    color: "#555",
  },
  sessionCard: {
    backgroundColor: "white",
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  confirmedBadge: {
    backgroundColor: "#d4edda",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  confirmedText: {
    color: "#28a745",
    fontSize: 12,
    fontWeight: "500",
  },
  sessionDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  sessionDetailText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 6,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 6,
  },
  viewDetailsText: {
    color: "#007BFF",
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    padding: 25,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
  marketingCard: {
    backgroundColor: "#f0f7ff",
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 25,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  marketingContent: {
    marginBottom: 10,
  },
  marketingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  marketingDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 18,
  },
  marketingButton: {
    alignSelf: "flex-start",
    backgroundColor: "#007BFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  marketingButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
}); 