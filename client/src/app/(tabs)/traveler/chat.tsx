import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/src/context/AuthContext";
import { getConversations, Conversation } from "@/src/services/api";
import socketService from "@/src/services/socketService";

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<Conversation[]>([]);
  const [filteredChats, setFilteredChats] = useState<Conversation[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    const connectSocket = async () => {
      if (user?.id) {
        const connected = await socketService.initialize(user.id);
        setSocketConnected(connected);
        
        // Handle connection status changes
        const unsubscribe = socketService.onConnectionStatusChange((connected) => {
          setSocketConnected(connected);
        });
        
        return () => {
          unsubscribe();
          socketService.disconnect();
        };
      }
    };
    
    connectSocket();
  }, [user]);

  // Handle real-time online status updates
  useEffect(() => {
    if (!socketConnected) return;
    
    const handleOnlineStatus = (userId: string, isOnline: boolean) => {
      setChats(prevChats => {
        const updatedChats = [...prevChats];
        const chatIndex = updatedChats.findIndex(chat => chat.id === userId);
        if (chatIndex !== -1) {
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            is_online: isOnline
          };
        }
        return updatedChats;
      });
    };
    
    const unsubscribe = socketService.onOnlineStatusChange(handleOnlineStatus);
    return () => unsubscribe();
  }, [socketConnected]);

  // Handle real-time new message updates
  useEffect(() => {
    if (!socketConnected || !user?.id) return;
    
    const handleNewMessage = (message: any) => {
      const isInbound = message.sender_id.toString() !== user.id.toString();
      
      if (isInbound) {
        const senderId = message.sender_id.toString();
        
        setChats(prevChats => {
          const updatedChats = [...prevChats];
          const chatIndex = updatedChats.findIndex(chat => chat.id === senderId);
          
          if (chatIndex !== -1) {
            // Update existing chat
            updatedChats[chatIndex] = {
              ...updatedChats[chatIndex],
              last_message: message.content,
              last_message_time: message.created_at,
              unread_count: updatedChats[chatIndex].unread_count + 1
            };
            
            // Move this chat to the top
            const updatedChat = updatedChats.splice(chatIndex, 1)[0];
            updatedChats.unshift(updatedChat);
          } else {
            // We might need to fetch user details if it's a new conversation
            fetchConversations();
          }
          
          return updatedChats;
        });
      }
    };
    
    const unsubscribe = socketService.onMessage(handleNewMessage);
    return () => unsubscribe();
  }, [socketConnected, user]);

  // Fetch conversations from API
  const fetchConversations = useCallback(async () => {
    try {
      const conversations = await getConversations();
      setChats(conversations);
      setFilteredChats(conversations);
      return conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadChats = async () => {
      setLoading(true);
      await fetchConversations();
      setLoading(false);
    };
    
    loadChats();
  }, [fetchConversations]);

  // Filter chats based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  const renderChatItem = (chat: Conversation) => (
    <TouchableOpacity
      key={chat.id}
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
      onPress={() => router.push(`/(traveler)/${chat.id}`)}
    >
      <View className="flex-row items-center">
        <View className="relative">
          {chat.photo_url ? (
            <Image
              source={{ uri: chat.photo_url }}
              className="w-16 h-16 rounded-full"
              defaultSource={require('@/assets/images/icon.png')}
              onError={(e) => {
                console.log('Error loading image:', e.nativeEvent.error);
              }}
            />
          ) : (
            <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center">
              <Text className="text-blue-600 text-xl font-semibold">
                {chat.name.charAt(0)}
              </Text>
            </View>
          )}
          {chat.is_online && (
            <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          )}
        </View>

        <View className="flex-1 ml-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-gray-900">
              {chat.name}
            </Text>
            <Text className="text-sm text-gray-500">
              {new Date(chat.last_message_time).toLocaleDateString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </Text>
          </View>
          
          <Text 
            className={`mt-1 ${
              chat.unread_count > 0 ? "text-gray-900 font-medium" : "text-gray-600"
            }`}
            numberOfLines={2}
          >
            {chat.last_message}
          </Text>

          {chat.booking_id && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="calendar-outline" size={14} color="#1a73e8" />
              <Text className="text-blue-600 text-sm ml-1">
                Upcoming Session
              </Text>
            </View>
          )}
        </View>

        {chat.unread_count > 0 && (
          <View className="bg-blue-600 rounded-full w-6 h-6 items-center justify-center ml-2">
            <Text className="text-white text-xs font-medium">
              {chat.unread_count > 99 ? '99+' : chat.unread_count}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="items-center justify-center py-12">
      <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-4">
        <Ionicons name="chatbubbles-outline" size={32} color="#1a73e8" />
      </View>
      <Text className="text-lg font-semibold text-gray-900 mb-2">
        No messages yet
      </Text>
      <Text className="text-gray-600 text-center px-8">
        Book a translator to start chatting or try another search term
      </Text>
      <TouchableOpacity
        className="mt-6 bg-blue-600 px-5 py-2 rounded-full"
        onPress={() => router.push('/(tabs)/traveler')}
      >
        <Text className="text-white font-medium">Find Translators</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4">
        <Text className="text-2xl font-bold text-gray-900">Messages</Text>
        <Text className="text-gray-600 mt-1">Chat with your translators</Text>
      </View>

      {/* Search Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-2 text-gray-900"
            placeholder="Search messages"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text className="text-gray-600 mt-4">Loading conversations...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="p-4">
            {filteredChats.length > 0 ? (
              filteredChats.map(renderChatItem)
            ) : (
              renderEmptyState()
            )}
          </View>
        </ScrollView>
      )}

      {!socketConnected && !loading && (
        <View className="absolute bottom-20 left-0 right-0 bg-yellow-50 px-4 py-2 border-t border-yellow-100">
          <Text className="text-yellow-800 text-center text-sm">
            Offline mode: You may not receive new messages in real-time
          </Text>
        </View>
      )}

      {/* Optional: New Message Button */}
      <View className="absolute bottom-6 right-6">
        <TouchableOpacity
          className="bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          onPress={() => router.push('/new-message')}
        >
          <Ionicons name="create" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
} 