import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  FlatList,
  ActivityIndicator,
  Image,
  Keyboard,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { ChatMessage, getMessages, sendMessage, markConversationAsRead } from "@/src/services/api";
import socketService from "@/src/services/socketService";

interface MessageData {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  isTyping?: boolean;
  isTranslated?: boolean;
  originalText?: string;
}

interface TranslatorProfile {
  id: string;
  name: string;
  avatar: string | null;
  isActive: boolean;
  lastSeen: string;
  languages: string[];
}

const TypingIndicator = () => {
  const [dot1] = useState(new Animated.Value(0));
  const [dot2] = useState(new Animated.Value(0));
  const [dot3] = useState(new Animated.Value(0));

  const animateDot = (dot: Animated.Value, delay: number) => {
    Animated.sequence([
      Animated.timing(dot, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(dot, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loop = () => {
    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);
    setTimeout(loop, 1200);
  };

  useEffect(() => {
    loop();
  }, []);

  return (
    <View className="flex-row items-center h-6 ml-2">
      {[dot1, dot2, dot3].map((dot, index) => (
        <Animated.View
          key={index}
          className="w-2 h-2 rounded-full bg-gray-400 mx-0.5"
          style={{
            transform: [
              {
                translateY: dot.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -5],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
};

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const userId = user?.id;
  const conversationId = id as string;

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [translator, setTranslator] = useState<TranslatorProfile | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const messagesEndRef = useRef<View>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    const connectSocket = async () => {
      if (userId) {
        await socketService.initialize(userId);
      }
    };

    connectSocket();

    return () => {
      socketService.disconnect();
    };
  }, [userId]);

  // Handle real-time messages
  useEffect(() => {
    const handleNewMessage = (message: any) => {
      // Only process messages that are part of this conversation
      const isFromConversationPartner =
        message.sender_id.toString() === conversationId ||
        message.receiver_id.toString() === conversationId;

      if (isFromConversationPartner) {
        const isInbound = message.sender_id.toString() !== userId?.toString();

        const newMessage: MessageData = {
          id: message.id.toString(),
          text: message.content,
          sender: isInbound ? 'other' : 'user',
          timestamp: message.created_at,
          status: isInbound ? undefined : 'sent'
        };

        setMessages(prev => [newMessage, ...prev]);

        // Mark inbound messages as read
        if (isInbound) {
          markConversationAsRead(conversationId);
        }
      }
    };

    const unsubscribe = socketService.onMessage(handleNewMessage);
    return () => unsubscribe();
  }, [conversationId, userId]);

  // Handle typing indicators
  useEffect(() => {
    const handleTypingStatus = (typingUserId: string, isTyping: boolean) => {
      if (typingUserId === conversationId) {
        setIsOtherUserTyping(isTyping);
      }
    };

    const unsubscribe = socketService.onTypingStatusChange(handleTypingStatus);
    return () => unsubscribe();
  }, [conversationId]);

  // Fetch translator profile and initial messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch messages
        const response = await getMessages(conversationId);

        // Transform messages to our format
        const transformedMessages: MessageData[] = response.messages.map(msg => ({
          id: msg.id.toString(),
          text: msg.content,
          sender: msg.sender_id.toString() === userId?.toString() ? 'user' : 'other',
          timestamp: msg.created_at,
          status: msg.read ? 'read' : 'delivered'
        }));

        setMessages(transformedMessages);
        setHasMoreMessages(response.total > transformedMessages.length);

        // Mark all messages as read
        await markConversationAsRead(conversationId);

        // Get the name of the translator from messages where sender is not current user
        const translatorMessage = response.messages.find(msg => 
          msg.sender_id.toString() !== userId?.toString()
        );
        
        // Fetch translator profile
        setTranslator({
          id: conversationId,
          name: translatorMessage ? translatorMessage.sender_name : "Translator",
          avatar: null,
          isActive: true,
          lastSeen: new Date().toISOString(),
          languages: ["English", "Spanish"]
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching chat data:', error);
        setLoading(false);
      }
    };

    if (userId && conversationId) {
      fetchData();
    }
  }, [conversationId, userId]);

  const loadMoreMessages = async () => {
    if (!hasMoreMessages || loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;

      const response = await getMessages(conversationId, nextPage);

      // Transform and add new messages
      const newMessages: MessageData[] = response.messages.map(msg => ({
        id: msg.id.toString(),
        text: msg.content,
        sender: msg.sender_id.toString() === userId?.toString() ? 'user' : 'other',
        timestamp: msg.created_at,
        status: msg.read ? 'read' : 'delivered'
      }));

      setMessages(prev => [...prev, ...newMessages]);
      setPage(nextPage);
      setHasMoreMessages(response.total > (messages.length + newMessages.length));
      setLoadingMore(false);
    } catch (error) {
      console.error('Error loading more messages:', error);
      setLoadingMore(false);
    }
  };

  const renderTypingIndicator = () => {
    if (!isOtherUserTyping) return null;

    return (
      <View className="flex-row items-start my-2 ml-2">
        <View className="bg-gray-200 rounded-2xl rounded-tl-none p-2 px-4 max-w-[80%]">
          <TypingIndicator />
        </View>
      </View>
    );
  };

  const handleTextChange = (text: string) => {
    setInputText(text);

    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      socketService.sendTypingStatus(true, conversationId);
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.sendTypingStatus(false, conversationId);
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !userId) return;

    const messageText = inputText.trim();
    setInputText("");

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    socketService.sendTypingStatus(false, conversationId);

    // Optimistically add message to UI
    const tempMessage: MessageData = {
      id: `temp-${Date.now()}`,
      text: messageText,
      sender: 'user',
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setMessages(prev => [tempMessage, ...prev]);

    // Send message to API
    try {
      const response = await sendMessage(conversationId, messageText);

      if (response) {
        // Replace temp message with actual message
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempMessage.id
              ? {
                id: response.id.toString(),
                text: response.content,
                sender: 'user',
                timestamp: response.created_at,
                status: 'sent'
              }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // You could add error handling here
    }
  };

  const toggleActions = () => {
    setShowActions(!showActions);
    if (isRecording) {
      setIsRecording(false);
    }
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    // Implement voice recording logic here
  };

  const renderMessage = ({ item }: { item: MessageData }) => {
    const isUserMessage = item.sender === 'user';
    const messageTime = new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View
        className={`my-1 mx-2 flex-row ${isUserMessage ? 'justify-end' : 'justify-start'
          }`}
      >
        <View
          className={`p-3 rounded-2xl max-w-[80%] ${isUserMessage
            ? 'bg-blue-500 rounded-tr-none'
            : 'bg-gray-200 rounded-tl-none'
            }`}
        >
          <Text
            className={`${isUserMessage ? 'text-white' : 'text-gray-800'
              } text-base`}
          >
            {item.text}
          </Text>

          {item.isTranslated && (
            <TouchableOpacity className="mt-1">
              <Text
                className={`text-xs italic ${isUserMessage ? 'text-blue-100' : 'text-gray-500'
                  }`}
              >
                Original: {item.originalText}
              </Text>
            </TouchableOpacity>
          )}

          <View
            className={`flex-row items-center justify-end mt-1 ${isUserMessage ? 'justify-end' : 'justify-start'
              }`}
          >
            <Text
              className={`text-xs mr-1 ${isUserMessage ? 'text-blue-100' : 'text-gray-500'
                }`}
            >
              {messageTime}
            </Text>

            {isUserMessage && item.status && (
              <Ionicons
                name={
                  item.status === 'read'
                    ? 'checkmark-done'
                    : item.status === 'delivered'
                      ? 'checkmark-done-outline'
                      : 'checkmark-outline'
                }
                size={16}
                color="#ffffff"
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text className="text-gray-600 mt-4">Loading conversation...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-3 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="p-2 -ml-2"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-row flex-1 items-center ml-2">
            {translator?.avatar ? (
              <Image
                source={{ uri: translator.avatar }}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <View className="w-10 h-10 rounded-full bg-blue-300 items-center justify-center">
                <Text className="text-blue-800 font-bold text-lg">
                  {translator?.name ? translator.name.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}

            <View className="ml-3">
              <Text className="text-white font-semibold text-lg">
                {translator?.name || 'Translator'}
              </Text>
              <Text className="text-blue-100 text-xs">
                {translator?.isActive
                  ? 'Online'
                  : `Last seen ${new Date(
                    translator?.lastSeen || new Date()
                  ).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`}
              </Text>
            </View>
          </View>

          <TouchableOpacity className="p-2">
            <Ionicons name="call-outline" size={22} color="white" />
          </TouchableOpacity>

          <TouchableOpacity className="p-2">
            <Ionicons name="ellipsis-vertical" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        className="flex-1 bg-gray-50"
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#1a73e8" />
            </View>
          ) : null
        }
        ListHeaderComponent={renderTypingIndicator()}
      />

      {/* Input area */}
      <View className="border-t border-gray-200 bg-white px-2 py-2">
        {showActions && (
          <View className="flex-row pb-2">
            <TouchableOpacity className="bg-gray-100 rounded-full p-3 mx-1">
              <Ionicons name="camera-outline" size={24} color="#4B5563" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 rounded-full p-3 mx-1">
              <Ionicons name="image-outline" size={24} color="#4B5563" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 rounded-full p-3 mx-1">
              <Ionicons name="document-outline" size={24} color="#4B5563" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 rounded-full p-3 mx-1">
              <Ionicons name="location-outline" size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>
        )}

        <View className="flex-row items-center">
          <TouchableOpacity
            className="p-2"
            onPress={toggleActions}
          >
            <Ionicons
              name={showActions ? "close-outline" : "add-outline"}
              size={28}
              color="#4B5563"
            />
          </TouchableOpacity>

          <View className="flex-1 bg-gray-100 rounded-full flex-row items-center px-3 py-1 mx-1">
            <TextInput
              className="flex-1 text-gray-800 py-2 px-1"
              placeholder="Type a message..."
              value={inputText}
              onChangeText={handleTextChange}
              multiline
              maxLength={500}
            />

            {inputText.length === 0 && (
              <TouchableOpacity className="p-1 ml-1">
                <Ionicons name="happy-outline" size={24} color="#4B5563" />
              </TouchableOpacity>
            )}
          </View>

          {inputText.length > 0 ? (
            <TouchableOpacity
              className="bg-blue-500 rounded-full p-2 ml-1"
              onPress={handleSendMessage}
            >
              <Ionicons name="send" size={22} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className={`rounded-full p-2 ml-1 ${isRecording ? 'bg-red-500' : 'bg-gray-200'
                }`}
              onPress={handleRecord}
            >
              <Ionicons
                name={isRecording ? "stop" : "mic-outline"}
                size={22}
                color={isRecording ? "white" : "#4B5563"}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
