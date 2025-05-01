import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useEffect, useState } from "react";
import { getBookings, getConversations } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

export default function TranslatorTabLayout() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Fetch pending requests and unread messages
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Fetch pending requests
        const bookings = await getBookings("pending");
        setPendingRequests(bookings.length);

        // Fetch conversations to count unread messages
        const conversations = await getConversations();
        console.log("Fetched conversations:", conversations);
        
        const totalUnread = conversations.reduce((total, conversation) => {
          console.log(`Conversation with ${conversation.name}: ${conversation.unread_count} unread`);
          return total + conversation.unread_count;
        }, 0);
        
        console.log("Total unread messages:", totalUnread);
        setUnreadMessages(totalUnread);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // Initial fetch
    if (user) {
      fetchNotifications();
    }

    // Set up interval to refresh data
    const interval = setInterval(() => {
      if (user) {
        fetchNotifications();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          height: Platform.OS === "ios" ? 85 : 65,
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#1a73e8",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="requests"
        options={{
          title: "Requests",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
          tabBarBadge: pendingRequests > 0 ? pendingRequests.toString() : undefined,
          tabBarBadgeStyle: { backgroundColor: "#1a73e8" },
        }}
      />
      
      <Tabs.Screen
        name="chat"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
          tabBarBadge: unreadMessages > 0 ? unreadMessages.toString() : undefined,
          tabBarBadgeStyle: { backgroundColor: "#1a73e8" },
        }}
      />
      
      <Tabs.Screen
        name="earnings"
        options={{
          title: "Earnings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
