import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

interface ChatPreview {
  id: string;
  translatorName: string;
  translatorPhoto: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  bookingId?: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for chats
  const chats: ChatPreview[] = [
    {
      id: "1",
      translatorName: "Sarah Martin",
      translatorPhoto: "https://placekitten.com/200/200",
      lastMessage: "See you tomorrow at the Eiffel Tower!",
      timestamp: "2m ago",
      unread: 2,
      online: true,
      bookingId: "123",
    },
    {
      id: "2",
      translatorName: "Jean Dupont",
      translatorPhoto: "https://placekitten.com/201/201",
      lastMessage: "Perfect, I'll prepare some historical information about the Louvre.",
      timestamp: "1h ago",
      unread: 0,
      online: false,
      bookingId: "456",
    },
    {
      id: "3",
      translatorName: "Maria Garcia",
      translatorPhoto: "https://placekitten.com/202/202",
      lastMessage: "Thank you for the great tour!",
      timestamp: "2d ago",
      unread: 0,
      online: false,
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
        <Text className="text-2xl font-bold text-gray-900">Messages</Text>
        <Text className="text-gray-600 mt-1">Chat with your translators</Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          {chats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
              onPress={() => router.push(`/chat/${chat.id}`)}
            >
              <View className="flex-row items-center">
                <View className="relative">
                  <Image
                    source={{ uri: chat.translatorPhoto }}
                    className="w-16 h-16 rounded-full"
                  />
                  {chat.online && (
                    <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </View>
                <View className="flex-1 ml-4">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-lg font-semibold text-gray-900">
                      {chat.translatorName}
                    </Text>
                    <Text className="text-sm text-gray-500">{chat.timestamp}</Text>
                  </View>
                  <Text 
                    className={`mt-1 ${
                      chat.unread > 0 ? "text-gray-900 font-medium" : "text-gray-600"
                    }`}
                    numberOfLines={2}
                  >
                    {chat.lastMessage}
                  </Text>
                  {chat.bookingId && (
                    <View className="flex-row items-center mt-2">
                      <Ionicons name="calendar-outline" size={14} color="#1a73e8" />
                      <Text className="text-blue-600 text-sm ml-1">
                        Upcoming Session
                      </Text>
                    </View>
                  )}
                </View>
                {chat.unread > 0 && (
                  <View className="bg-blue-600 rounded-full w-6 h-6 items-center justify-center ml-2">
                    <Text className="text-white text-xs font-medium">
                      {chat.unread}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {chats.length === 0 && (
            <View className="items-center justify-center py-12">
              <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-4">
                <Ionicons name="chatbubbles-outline" size={32} color="#1a73e8" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                No messages yet
              </Text>
              <Text className="text-gray-600 text-center">
                Book a translator to start chatting
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
