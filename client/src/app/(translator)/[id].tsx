import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  Image,
  Pressable,
  ActivityIndicator,
  Alert
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getMessages, sendMessage, markConversationAsRead, ChatMessage } from '../../services/api';
import socketService from '../../services/socketService';

// Define message type
interface MessageData {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  isTranslated?: boolean;
  originalText?: string;
}

interface TravelerProfile {
  id: string;
  name: string;
  photo_url: string | null;
  is_online: boolean;
  languages?: string[];
}

const TypingIndicator = () => {
  const [dot1] = useState(new Animated.Value(0.4));
  const [dot2] = useState(new Animated.Value(0.4));
  const [dot3] = useState(new Animated.Value(0.4));

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.sequence([
        Animated.timing(dot, {
          toValue: 1,
          duration: 300,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0.4,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const loop = () => {
      animateDot(dot1, 0);
      animateDot(dot2, 150);
      animateDot(dot3, 300);
    };

    const interval = setInterval(loop, 1000);
    loop(); // Start immediately

    return () => clearInterval(interval);
  }, [dot1, dot2, dot3]);

  return (
    <View style={[styles.messageBubble, { backgroundColor: '#F2F2F7', padding: 12 }]}>
      <View style={styles.typingContainer}>
        <Animated.View style={[styles.typingDot, { opacity: dot1 }]} />
        <Animated.View style={[styles.typingDot, { opacity: dot2 }]} />
        <Animated.View style={[styles.typingDot, { opacity: dot3 }]} />
      </View>
    </View>
  );
};

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams();
  const conversationId = id as string;
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id;

  const [messageText, setMessageText] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [traveler, setTraveler] = useState<TravelerProfile | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  // Animation values
  const actionsHeight = useRef(new Animated.Value(0)).current;
  const inputFocused = useRef(new Animated.Value(0)).current;

  // Connect to WebSocket
  useEffect(() => {
    const connectSocket = async () => {
      if (user?.id) {
        const connected = await socketService.initialize(user.id);
        setSocketConnected(connected);
      }
    };

    connectSocket();

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  // Handle real-time typing status updates
  useEffect(() => {
    if (!socketConnected || !userId || !conversationId) return;

    const handleTypingStatus = (typingUserId: string, isTyping: boolean) => {
      // Only update typing status if it's from the current conversation partner
      if (typingUserId === conversationId) {
        setIsTyping(isTyping);
      }
    };

    const unsubscribe = socketService.onTypingStatusChange(handleTypingStatus);
    return () => unsubscribe();
  }, [socketConnected, userId, conversationId]);

  // Handle real-time message updates
  useEffect(() => {
    if (!socketConnected || !userId || !conversationId) return;

    const handleNewMessage = (message: ChatMessage) => {
      // Only add new messages from the current conversation
      if ((message.sender_id.toString() === conversationId || message.receiver_id.toString() === conversationId)) {
        const newMessage: MessageData = {
          id: message.id.toString(),
          text: message.content,
          sender: message.sender_id.toString() === userId?.toString() ? 'user' : 'other',
          timestamp: message.created_at,
          status: message.read_at ? 'read' : 'delivered'
        };

        setMessages(prevMessages => {
          // Check if message already exists
          if (prevMessages.some(msg => msg.id === newMessage.id)) {
            return prevMessages;
          }
          return [...prevMessages, newMessage];
        });

        // Mark message as read if it's from the other person
        if (message.sender_id.toString() === conversationId) {
          markConversationAsRead(conversationId);
        }
      }
    };

    const unsubscribe = socketService.onMessage(handleNewMessage);
    return () => unsubscribe();
  }, [socketConnected, userId, conversationId]);

  // Fetch chat data
  useEffect(() => {
    const fetchChatData = async () => {
      if (!userId || !conversationId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch messages from API
        const response = await getMessages(conversationId);

        // Transform messages to our format
        const formattedMessages: MessageData[] = response.messages.map(msg => ({
          id: msg.id.toString(),
          text: msg.content,
          sender: msg.sender_id.toString() === userId.toString() ? 'user' : 'other',
          timestamp: msg.created_at,
          status: msg.read_at ? 'read' : 'delivered'
        }));

        setMessages(formattedMessages);
        setHasMoreMessages(response.total > formattedMessages.length);
        setCurrentPage(1);

        // Mark conversation as read
        await markConversationAsRead(conversationId);

        // Set traveler info
        // In a real implementation, you would get this from API
        setTraveler({
          id: conversationId,
          name: response.messages.length > 0 && response.messages[0].sender_id.toString() !== userId.toString() 
            ? response.messages[0].sender_name 
            : "Traveler",
          photo_url: null,
          is_online: false
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching chat data:', error);
        setError('Failed to load conversation. Please try again.');
        setIsLoading(false);
      }
    };

    fetchChatData();
  }, [userId, conversationId]);

  // Load more messages
  const loadMoreMessages = async () => {
    if (!hasMoreMessages || isLoadingMore || !conversationId) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;

      const response = await getMessages(conversationId, nextPage);

      // Transform and add messages
      const olderMessages: MessageData[] = response.messages.map(msg => ({
        id: msg.id.toString(),
        text: msg.content,
        sender: msg.sender_id.toString() === userId?.toString() ? 'user' : 'other',
        timestamp: msg.created_at,
        status: msg.read_at ? 'read' : 'delivered'
      }));

      setMessages(prevMessages => [...olderMessages, ...prevMessages]);
      setHasMoreMessages(response.total > (olderMessages.length + messages.length));
      setCurrentPage(nextPage);
      setIsLoadingMore(false);
    } catch (error) {
      console.error('Error loading more messages:', error);
      setIsLoadingMore(false);
    }
  };

  // Send typing indicators to the server
  const handleTextChange = (text: string) => {
    setMessageText(text);

    if (text.length > 0 && socketConnected && conversationId) {
      // Send typing indicator
      socketService.sendTypingStatus(true, conversationId);

      // Stop typing indicator after 2 seconds of inactivity
      const debounce = setTimeout(() => {
        socketService.sendTypingStatus(false, conversationId);
      }, 2000);

      return () => clearTimeout(debounce);
    }
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (messageText.trim() === '' || !conversationId) return;

    try {
      // Add optimistic message to UI first
      const optimisticMessage: MessageData = {
        id: `temp-${Date.now()}`,
        text: messageText,
        sender: 'user',
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      setMessages(prev => [...prev, optimisticMessage]);
      setMessageText('');

      // Stop typing indicator
      socketService.sendTypingStatus(false, conversationId);

      // Scroll to bottom
      flatListRef.current?.scrollToEnd({ animated: true });

      // Actually send the message
      const sentMessage = await sendMessage(conversationId, messageText);

      if (sentMessage) {
        // Replace optimistic message with actual message
        setMessages(prev =>
          prev.map(msg =>
            msg.id === optimisticMessage.id ? {
              id: sentMessage.id.toString(),
              text: sentMessage.content,
              sender: 'user',
              timestamp: sentMessage.created_at,
              status: 'delivered'
            } : msg
          )
        );
      } else {
        // Show error if message failed to send
        Alert.alert('Error', 'Failed to send message. Please try again.');

        // Remove optimistic message
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  // Toggle actions menu
  const toggleActions = () => {
    setShowActions(!showActions);
    Animated.timing(actionsHeight, {
      toValue: showActions ? 0 : 120,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  // Handle voice recording
  const handleRecord = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };

  // Render message item
  const renderMessage = ({ item }: { item: MessageData }) => {
    const isUser = item.sender === 'user';

    // Determine if we should show timestamp
    const msgIndex = messages.findIndex(m => m.id === item.id);
    const showTimestamp = msgIndex === 0 ||
      new Date(item.timestamp).getHours() !== new Date(messages[msgIndex - 1]?.timestamp || new Date()).getHours();

    // Determine if we should show the status
    const showStatus = isUser && item.id === messages[messages.length - 1]?.id;

    return (
      <View style={[styles.messageWrapper, isUser ? styles.userMessageWrapper : styles.travelerMessageWrapper]}>
        {showTimestamp && (
          <View style={styles.timestampContainer}>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}

        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.travelerBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.travelerMessageText]}>
            {item.text}
          </Text>

          {/* Show translate option or original text */}
          {!isUser && !item.isTranslated && (
            <TouchableOpacity style={styles.translateButton}>
              <Text style={styles.translateButtonText}>Translate</Text>
            </TouchableOpacity>
          )}

          {!isUser && item.isTranslated && (
            <View style={styles.originalTextContainer}>
              <Text style={styles.originalTextLabel}>Original:</Text>
              <Text style={styles.originalText}>{item.originalText}</Text>
            </View>
          )}
        </View>

        {/* Message status for user messages */}
        {showStatus && (
          <View style={styles.statusContainer}>
            {item.status === 'sent' && <Ionicons name="checkmark" size={14} color="#8E8E93" />}
            {item.status === 'delivered' && <Ionicons name="checkmark-done" size={14} color="#8E8E93" />}
            {item.status === 'read' && <Ionicons name="checkmark-done" size={14} color="#0066CC" />}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#0066CC" />
          </TouchableOpacity>

          {traveler && (
            <TouchableOpacity
              style={styles.travelerInfo}
              onPress={() => {
                // Navigate to traveler profile
              }}
            >
              <View style={styles.travelerInfoContent}>
                <View style={styles.avatarWrapper}>
                  <View style={styles.avatar}>
                    {traveler.photo_url ? (
                      <Image source={{ uri: traveler.photo_url }} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.avatarText}>{traveler.name ? traveler.name.charAt(0).toUpperCase() : "T"}</Text>
                    )}
                  </View>
                  {traveler.is_online && <View style={styles.activeIndicator} />}
                </View>

                <View style={styles.travelerTextInfo}>
                  <Text style={styles.travelerName} numberOfLines={1}>{traveler.name}</Text>
                  <Text style={styles.travelerStatus}>
                    {traveler.is_online ? 'Active now' : 'Last seen recently'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-vertical" size={20} color="#0066CC" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        </View>

        {/* Info Banner */}
        <BlurView intensity={80} tint="light" style={styles.infoBanner}>
          <Ionicons name="information-circle" size={18} color="#0066CC" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            You're chatting with a traveler about their upcoming trip. Be respectful and professional.
          </Text>
        </BlurView>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            <>
              {isTyping && (
                <View style={styles.typingContainer}>
                  <TypingIndicator />
                </View>
              )}
              <View style={{ height: 20 }} />
            </>
          )}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
        />

        {/* Message Input */}
        <Animated.View
          style={[
            styles.inputContainer,
            {
              borderTopLeftRadius: inputFocused.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              }),
              borderTopRightRadius: inputFocused.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              }),
            }
          ]}
        >
          <BlurView intensity={80} tint="light" style={styles.inputBlur}>
            {/* Actions Menu */}
            <Animated.View style={[styles.actionsMenu, { height: actionsHeight }]}>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <View style={[styles.actionButtonIcon, { backgroundColor: '#F2F8FF' }]}>
                    <Ionicons name="image" size={20} color="#0066CC" />
                  </View>
                  <Text style={styles.actionButtonText}>Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <View style={[styles.actionButtonIcon, { backgroundColor: '#F2F8FF' }]}>
                    <Ionicons name="document-text" size={20} color="#0066CC" />
                  </View>
                  <Text style={styles.actionButtonText}>Document</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <View style={[styles.actionButtonIcon, { backgroundColor: '#F2F8FF' }]}>
                    <Ionicons name="location" size={20} color="#0066CC" />
                  </View>
                  <Text style={styles.actionButtonText}>Location</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <View style={[styles.actionButtonIcon, { backgroundColor: '#F2F8FF' }]}>
                    <MaterialCommunityIcons name="translate" size={20} color="#0066CC" />
                  </View>
                  <Text style={styles.actionButtonText}>Translate</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Input Actions */}
            <View style={styles.inputActions}>
              <TouchableOpacity style={styles.attachButton} onPress={toggleActions}>
                <Ionicons name="add-circle" size={24} color="#0066CC" />
              </TouchableOpacity>

              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type a message..."
                  value={messageText}
                  onChangeText={handleTextChange}
                  multiline
                  maxLength={1000}
                  onFocus={() => {
                    if (showActions) {
                      setShowActions(false);
                      Animated.timing(actionsHeight, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: false,
                      }).start();
                    }
                  }}
                />

                <TouchableOpacity style={styles.emojiButton}>
                  <Ionicons name="happy" size={22} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              {messageText.trim() ? (
                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                  <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.sendButton, styles.micButton, isRecording && styles.recordingButton]}
                  onPress={handleRecord}
                >
                  <Ionicons name={isRecording ? "stop" : "mic"} size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </BlurView>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 5,
    marginRight: 5,
  },
  travelerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  travelerInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: 'white',
  },
  travelerTextInfo: {
    flex: 1,
  },
  travelerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  travelerStatus: {
    fontSize: 12,
    color: '#666',
  },
  moreButton: {
    padding: 8,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#555',
    flex: 1,
  },
  messagesContainer: {
    padding: 15,
  },
  messageWrapper: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
  },
  travelerMessageWrapper: {
    alignSelf: 'flex-start',
  },
  timestampContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 38,
  },
  userBubble: {
    backgroundColor: '#0066CC',
    borderBottomRightRadius: 4,
  },
  travelerBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  travelerMessageText: {
    color: '#333',
  },
  translatedBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  translatedText: {
    fontSize: 12,
    color: '#0066CC',
    fontStyle: 'italic',
  },
  messageStatus: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    marginRight: 4,
  },
  typingBubble: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    width: 70,
    marginTop: 8,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8E8E93',
    opacity: 0.5,
  },
  typingDot1: {
    opacity: 0.5,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 0.9,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  inputBlur: {
    overflow: 'hidden',
  },
  actionsMenu: {
    overflow: 'hidden',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  attachButton: {
    padding: 8,
    marginRight: 5,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  emojiButton: {
    padding: 5,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    backgroundColor: '#5AC8FA',
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  messageContent: {
    flex: 1,
    paddingLeft: 10,
  },
  typingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: 50,
  },
  translateButton: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  translateButtonText: {
    fontSize: 12,
    color: '#0066CC',
    fontWeight: '500',
  },
  originalTextContainer: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  originalTextLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  originalText: {
    fontSize: 12,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    marginRight: 4,
  },
});
