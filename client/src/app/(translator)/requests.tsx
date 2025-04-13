import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  StatusBar,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { LineChart } from "react-native-chart-kit";

// Get screen dimensions
const { width } = Dimensions.get("window");

// Mock data for booking requests
const MOCK_REQUESTS = [
  {
    id: "r1",
    travelerName: "James Wilson",
    travelerImage: "https://randomuser.me/api/portraits/men/44.jpg",
    location: "Tokyo Tower, Tokyo",
    date: "2023-06-05",
    time: "14:00",
    duration: 3,
    status: "pending",
    languages: ["English", "Japanese"],
    amount: 150,
    message: "I need help navigating Tokyo and visiting some traditional sites.",
    createdAt: "2023-05-20T09:30:00Z",
    travelerRating: 4.7,
    tripType: "Tourism",
    preferences: ["Cultural Sites", "Local Food"],
    previousTrips: 3,
  },
  {
    id: "r2",
    travelerName: "Elena Rodriguez",
    travelerImage: "https://randomuser.me/api/portraits/women/33.jpg",
    location: "Louvre Museum, Paris",
    date: "2023-06-10",
    time: "10:00",
    duration: 4,
    status: "pending",
    languages: ["English", "French"],
    amount: 200,
    message: "Looking for assistance navigating the Louvre and understanding the history of key artworks.",
    createdAt: "2023-05-21T14:15:00Z",
    travelerRating: 4.9,
    tripType: "Art & Culture",
    preferences: ["Museums", "History"],
    previousTrips: 7,
  },
  {
    id: "r3",
    travelerName: "Ahmed Hassan",
    travelerImage: "https://randomuser.me/api/portraits/men/36.jpg",
    location: "Pyramids of Giza, Cairo",
    date: "2023-06-15",
    time: "08:00",
    duration: 5,
    status: "accepted",
    languages: ["English", "Arabic"],
    amount: 220,
    message: "Need translation help while visiting the pyramids and surrounding historical sites.",
    createdAt: "2023-05-22T08:45:00Z",
    travelerRating: 4.5,
    tripType: "Historical",
    preferences: ["Ancient Monuments", "Local Traditions"],
    previousTrips: 2,
  },
  {
    id: "r4",
    travelerName: "Sofia Chen",
    travelerImage: "https://randomuser.me/api/portraits/women/65.jpg",
    location: "Grand Canal, Venice",
    date: "2023-06-18",
    time: "16:00",
    duration: 3,
    status: "declined",
    languages: ["English", "Italian"],
    amount: 180,
    message: "Looking for a local translator to help with restaurant bookings and navigation around Venice.",
    createdAt: "2023-05-23T10:30:00Z",
    travelerRating: 4.8,
    tripType: "Leisure",
    preferences: ["Local Cuisine", "Photography"],
    previousTrips: 5,
  },
];

// Status filters for the requests
const STATUS_FILTERS = [
  { id: "all", label: "All Requests" },
  { id: "pending", label: "Pending" },
  { id: "accepted", label: "Accepted" },
  { id: "declined", label: "Declined" },
];

// Chart data for daily requests
const chartData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      data: [2, 3, 1, 5, 4, 3, 2],
      color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
      strokeWidth: 2
    }
  ],
};

export default function TranslatorRequestsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [showChartView, setShowChartView] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const chartAnimValue = useRef(new Animated.Value(0)).current;

  // Stats calculations
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(req => req.status === "pending").length;
  const acceptedRequests = requests.filter(req => req.status === "accepted").length;
  const totalAmount = requests.reduce((sum, req) => 
    req.status === "accepted" ? sum + req.amount : sum, 0);
  const acceptanceRate = totalRequests > 0 
    ? Math.round((acceptedRequests / totalRequests) * 100)
    : 0;
  
  // Effect for entrance animation
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Toggle chart view with animation
  const toggleChartView = () => {
    if (showChartView) {
      Animated.timing(chartAnimValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setShowChartView(false));
    } else {
      setShowChartView(true);
      Animated.timing(chartAnimValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API fetch
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleAccept = (requestId: string) => {
    Alert.alert(
      t("requests.acceptTitle"),
      t("requests.acceptConfirm"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.confirm"),
          onPress: () => {
            // In a real app, make API call to accept booking
            setRequests(
              requests.map((req) =>
                req.id === requestId ? { ...req, status: "accepted" } : req
              )
            );
            // Show success feedback
            Alert.alert(
              "Success",
              "Request accepted! The traveler has been notified.",
              [{ text: "OK" }]
            );
          },
        },
      ]
    );
  };

  const handleDecline = (requestId: string) => {
    Alert.alert(
      t("requests.declineTitle"),
      t("requests.declineConfirm"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.confirm"),
          style: "destructive",
          onPress: () => {
            // In a real app, make API call to decline booking
            setRequests(
              requests.map((req) =>
                req.id === requestId ? { ...req, status: "declined" } : req
              )
            );
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: "short" as const, 
      day: "numeric" as const, 
      year: "numeric" as const 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate time difference from now for the "received" message
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now.getTime() - past.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return t("requests.justNow");
    } else if (diffInHours < 24) {
      return t("requests.hoursAgo", { count: diffInHours });
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return t("requests.daysAgo", { count: diffInDays });
    }
  };

  // Filter requests based on active filter
  const filteredRequests = activeFilter === "all"
    ? requests
    : requests.filter(request => request.status === activeFilter);

  // Toggle expanded state for a request
  const toggleExpand = (requestId: string) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };
  
  // Render individual request card
  const renderRequestCard = (request: typeof MOCK_REQUESTS[0]) => {
    const isExpanded = expandedRequest === request.id;
    
    return (
      <Animated.View 
        key={request.id}
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className={`bg-white rounded-xl shadow-sm mb-4 overflow-hidden ${
          request.status === "accepted"
            ? "border-l-4 border-l-green-500"
            : request.status === "declined"
            ? "border-l-4 border-l-red-500 opacity-80"
            : ""
        }`}
      >
        {/* Request Header */}
        <TouchableOpacity
          onPress={() => toggleExpand(request.id)}
          activeOpacity={0.7}
          className="active:bg-neutral-50"
        >
          <View className="p-4 border-b border-neutral-gray-100">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Image
                  source={{ uri: request.travelerImage }}
                  className="w-12 h-12 rounded-full"
                />
                <View className="ml-3">
                  <Text className="text-neutral-gray-800 font-medium text-lg">
                    {request.travelerName}
                  </Text>
                  <View className="flex-row items-center">
                    <MaterialIcons
                      name="translate"
                      size={14}
                      color="#6C757D"
                    />
                    <Text className="text-xs text-neutral-gray-600 ml-1">
                      {request.languages.join(" → ")}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View className="items-end">
                <Text className="text-primary font-bold text-lg">
                  ${request.amount}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-neutral-gray-500 text-xs">
                    {request.duration}h
                  </Text>
                  <Text className="text-neutral-gray-400 mx-1">•</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text className="text-neutral-gray-500 text-xs ml-1">
                      {request.travelerRating}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Request Details */}
        <View className="p-4">
          {/* Received time */}
          <View className="flex-row items-center mb-3">
            <Ionicons name="time-outline" size={16} color="#6C757D" />
            <Text className="text-xs text-neutral-gray-500 ml-1">
              {t("requests.received")} {getTimeAgo(request.createdAt)}
            </Text>
          </View>

          {/* Message from traveler */}
          <View className="bg-neutral-gray-50 p-3 rounded-lg mb-3">
            <Text className="text-neutral-gray-700 text-sm">
              "{request.message}"
            </Text>
          </View>

          {/* Location and time details */}
          <View className="flex-row items-center mb-2">
            <Ionicons
              name="location-outline"
              size={16}
              color="#6C757D"
            />
            <Text className="text-sm text-neutral-gray-700 ml-2">
              {request.location}
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Ionicons
              name="calendar-outline"
              size={16}
              color="#6C757D"
            />
            <Text className="text-sm text-neutral-gray-700 ml-2">
              {formatDate(request.date)} • {request.time}
            </Text>
          </View>
          
          {/* Expanded details */}
          {isExpanded && (
            <View className="mt-3 pt-3 border-t border-neutral-gray-100">
              <Text className="text-sm font-medium text-neutral-gray-700 mb-2">
                Additional Details
              </Text>
              
              <View className="bg-neutral-gray-50 rounded-lg p-3 mb-3">
                <View className="flex-row mb-2">
                  <View className="flex-1 flex-row items-center">
                    <FontAwesome5 name="suitcase" size={12} color="#6C757D" />
                    <Text className="text-xs text-neutral-gray-600 ml-2">
                      Trip Type
                    </Text>
                  </View>
                  <Text className="text-xs font-medium text-neutral-gray-700">
                    {request.tripType}
                  </Text>
                </View>
                
                <View className="flex-row mb-2">
                  <View className="flex-1 flex-row items-center">
                    <FontAwesome5 name="history" size={12} color="#6C757D" />
                    <Text className="text-xs text-neutral-gray-600 ml-2">
                      Previous Trips
                    </Text>
                  </View>
                  <Text className="text-xs font-medium text-neutral-gray-700">
                    {request.previousTrips}
                  </Text>
                </View>
                
                <View className="mb-1">
                  <View className="flex-row items-center mb-1">
                    <FontAwesome5 name="heart" size={12} color="#6C757D" />
                    <Text className="text-xs text-neutral-gray-600 ml-2">
                      Preferences
                    </Text>
                  </View>
                  <View className="flex-row flex-wrap mt-1">
                    {request.preferences.map((pref, index) => (
                      <View key={index} className="bg-primary bg-opacity-10 px-2 py-1 rounded-full mr-2 mb-1">
                        <Text className="text-xs text-primary">
                          {pref}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Actions */}
          <View className="flex-row justify-end mt-3 pt-3 border-t border-neutral-gray-100">
            {request.status === "pending" && (
              <>
                <TouchableOpacity
                  className="flex-row items-center justify-center bg-error px-4 py-2 rounded-lg mr-3"
                  onPress={() => handleDecline(request.id)}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={18}
                    color="#FFF"
                  />
                  <Text className="text-white font-medium ml-1">
                    {t("requests.decline")}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-row items-center justify-center bg-primary px-4 py-2 rounded-lg"
                  onPress={() => handleAccept(request.id)}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#FFF"
                  />
                  <Text className="text-white font-medium ml-1">
                    {t("requests.accept")}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {request.status === "accepted" && (
              <View className="flex-row">
                <TouchableOpacity 
                  className="flex-row items-center bg-primary px-4 py-2 rounded-lg mr-3"
                  onPress={() => router.push("/chat")}
                >
                  <Ionicons name="chatbubble-outline" size={16} color="#FFF" />
                  <Text className="text-white text-sm font-medium ml-1">
                    Message
                  </Text>
                </TouchableOpacity>
              
                <View className="flex-row items-center bg-green-100 px-3 py-1 rounded-full">
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color="#22C55E"
                  />
                  <Text className="text-green-700 text-sm font-medium ml-1">
                    {t("requests.accepted")}
                  </Text>
                </View>
              </View>
            )}

            {request.status === "declined" && (
              <View className="flex-row items-center bg-red-100 px-3 py-1 rounded-full">
                <Ionicons
                  name="close-circle"
                  size={16}
                  color="#EF4444"
                />
                <Text className="text-red-700 text-sm font-medium ml-1">
                  {t("requests.declined")}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  const chartHeight = chartAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  return (
    <View className="flex-1 bg-neutral-gray-100">
      <StatusBar barStyle="light-content" />
      
      {/* Header with stats */}
      <LinearGradient
        colors={["#0066CC", "#004494"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-4 px-5 pb-6"
        style={{
          paddingTop: insets.top + 16,
        }}
      >
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-8 h-8 justify-center items-center rounded-full bg-white bg-opacity-20"
          >
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
          
          <Text className="text-white text-xl font-bold">
            Booking Requests
          </Text>
          
          <TouchableOpacity 
            onPress={toggleChartView}
            className="w-8 h-8 justify-center items-center rounded-full bg-white bg-opacity-20"
          >
            <Ionicons name={showChartView ? "stats-chart" : "stats-chart-outline"} size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <Text className="text-white text-opacity-90 mb-5">
          Manage all your translation booking requests
        </Text>

        {/* Stats Cards */}
        <View className="flex-row mb-3 -mx-1">
          <View className="flex-1 bg-white bg-opacity-15 rounded-xl mx-1 p-3">
            <Text className="text-white text-opacity-80 text-xs">
              Pending
            </Text>
            <Text className="text-white text-xl font-bold mt-1">
              {pendingRequests}
            </Text>
          </View>
          
          <View className="flex-1 bg-white bg-opacity-15 rounded-xl mx-1 p-3">
            <Text className="text-white text-opacity-80 text-xs">
              Acceptance
            </Text>
            <Text className="text-white text-xl font-bold mt-1">
              {acceptanceRate}%
            </Text>
          </View>
          
          <View className="flex-1 bg-white bg-opacity-15 rounded-xl mx-1 p-3">
            <Text className="text-white text-opacity-80 text-xs">
              Earnings
            </Text>
            <Text className="text-white text-xl font-bold mt-1">
              ${totalAmount}
            </Text>
          </View>
        </View>
      </LinearGradient>
      
      {/* Chart View */}
      {showChartView && (
        <Animated.View 
          style={{ height: chartHeight, overflow: 'hidden' }}
          className="bg-white mx-4 -mt-3 mb-3 p-4 rounded-xl shadow-sm"
        >
          <Text className="text-neutral-gray-800 font-medium mb-2">
            Weekly Request Volume
          </Text>
          <LineChart
            data={chartData}
            width={width - 32}
            height={180}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: "#0066CC",
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </Animated.View>
      )}
      
      {/* Filter Tabs */}
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 pt-2 pb-3"
      >
        {STATUS_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            className={`mr-2 px-4 py-2 rounded-full ${
              activeFilter === filter.id
                ? "bg-primary"
                : "bg-white"
            }`}
            onPress={() => setActiveFilter(filter.id)}
          >
            <Text
              className={`text-sm font-medium ${
                activeFilter === filter.id
                  ? "text-white"
                  : "text-neutral-gray-600"
              }`}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredRequests}
        renderItem={({ item }) => renderRequestCard(item)}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-10 mt-10">
            <Ionicons
              name={
                activeFilter === "pending"
                  ? "timer-outline"
                  : activeFilter === "accepted"
                  ? "checkmark-done-outline"
                  : activeFilter === "declined"
                  ? "close-circle-outline"
                  : "calendar-outline"
              }
              size={64}
              color="#CCC"
            />
            <Text className="text-lg font-bold text-neutral-gray-600 mt-4">
              No {activeFilter !== "all" ? activeFilter : ""} requests
            </Text>
            <Text className="text-neutral-gray-500 text-center mt-2">
              {activeFilter === "all"
                ? "You haven't received any booking requests yet"
                : activeFilter === "pending"
                ? "No pending requests to review right now"
                : activeFilter === "accepted"
                ? "You haven't accepted any requests yet"
                : "You haven't declined any requests yet"}
            </Text>
          </View>
        }
      />
    </View>
  );
} 