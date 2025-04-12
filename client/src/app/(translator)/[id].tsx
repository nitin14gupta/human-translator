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
  ActivityIndicator
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

// Define message type
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'traveler';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'typing';
  isTranslated?: boolean;
  originalText?: string;
}

interface Traveler {
  id: string;
  name: string;
  avatar: string | null;
  isActive: boolean;
  lastSeen: string;
  languages: string[];
  rating?: number;
  location?: string;
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
  const router = useRouter();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [traveler, setTraveler] = useState<Traveler | null>(null);
  const flatListRef = useRef<FlatList>(null);
  
  // Animation values
  const actionsHeight = useRef(new Animated.Value(0)).current;
  const inputFocused = useRef(new Animated.Value(0)).current;

  // Mock messages data
  const [messages, setMessages] = useState<Message[]>([]);

  // Render typing indicator function
  const renderTypingIndicator = () => {
    if (isTyping) {
      return (
        <View style={styles.messageContainer}>
          {traveler?.avatar ? (
            <Image
              source={{ uri: traveler.avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatar}>
              {traveler && <Text style={styles.avatarText}>{traveler.name[0]}</Text>}
            </View>
          )}
          <View style={styles.messageContent}>
            <TypingIndicator />
          </View>
        </View>
      );
    }
    return null;
  };

  // Load chat data
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      // Mock traveler data
      setTraveler({
        id: id as string,
        name: 'John Smith',
        avatar: null,
        isActive: true,
        lastSeen: 'Active now',
        languages: ['English', 'French'],
        rating: 4.8,
        location: 'Paris, France'
      });

      // Mock messages data
      setMessages([
        {
          id: '1',
          text: 'Hello! I need your help for my trip to the Louvre tomorrow.',
          sender: 'traveler',
          timestamp: '10:30 AM',
          status: 'read'
        },
        {
          id: '2',
          text: "Hi John! I'd be happy to help. What time are you planning to visit?",
          sender: 'user',
          timestamp: '10:32 AM',
          status: 'read'
        },
        {
          id: '3',
          text: 'I was thinking around 9 AM to avoid the crowds. Would that work for you?',
          sender: 'traveler',
          timestamp: '10:35 AM',
          status: 'read'
        },
        {
          id: '4',
          text: '9 AM works perfectly. I can meet you at the main entrance under the pyramid.',
          sender: 'user',
          timestamp: '10:36 AM',
          status: 'read'
        },
        {
          id: '5',
          text: 'Great! How will I recognize you?',
          sender: 'traveler',
          timestamp: '10:38 AM',
          status: 'read'
        },
        {
          id: '6',
          text: "I'll be wearing a blue jacket and holding a sign with your name. Also, I've sent you my photo in my profile.", 
          sender: 'user',
          timestamp: '10:40 AM',
          status: 'read'
        },
        {
          id: '7',
          text: "Perfect! By the way, how long do you think we'll need for the main highlights of the museum?",
          sender: 'traveler',
          timestamp: '10:45 AM',
          status: 'read'
        },
      ]);

      setIsLoading(false);
      
      // Simulate traveler typing after 2 seconds
      setTimeout(() => {
        setIsTyping(true);
        
        // Simulate receiving a message after typing
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            id: '8',
            text: 'Also, do I need to buy tickets in advance or can we get them at the entrance?',
            sender: 'traveler',
            timestamp: '10:48 AM',
            status: 'delivered'
          }]);
        }, 3000);
      }, 2000);
    }, 1000);
    
    // Keyboard listeners for UI adjustments
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        Animated.timing(inputFocused, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }).start();
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(inputFocused, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [id]);

  // Send typing indicator
  const sendTypingIndicator = () => {
    if (!isTyping) {
      setIsTyping(true);
      
      // Add typing indicator message temporarily
      const typingMessage: Message = {
        id: 'typing',
        text: '',
        sender: 'traveler',
        timestamp: new Date().toISOString(),
        type: 'typing'
      };
      
      const newMessages = [...messages, typingMessage];
      setMessages(newMessages);
      
      // Remove typing indicator after some time
      setTimeout(() => {
        setMessages(messages => messages.filter(m => m.id !== 'typing'));
        setIsTyping(false);
      }, 3000);
    }
  };

  // Handle sending message
  const handleSendMessage = () => {
    if (messageText.trim() === '') return;
    
    // Add new message to the list
    const newMessage: Message = {
      id: (messages.length + 1).toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    
    setMessages([...messages, newMessage]);
    setMessageText('');
    
    // Simulate message being delivered and read
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? {...msg, status: 'delivered'} : msg
        )
      );
    }, 1000);
    
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? {...msg, status: 'read'} : msg
        )
      );
      
      // Simulate traveler typing
      sendTypingIndicator();
      
      // Simulate response after typing
      setTimeout(() => {
        const response: Message = {
          id: (messages.length + 2).toString(),
          text: "Sure, I'll meet you at the train station at 2 PM. Looking forward to our tour!",
          sender: 'traveler',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev.filter(m => m.id !== 'typing'), response]);
      }, 3500);
    }, 2000);
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
  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    const showTimestamp = item.id === '1' || 
      new Date(item.timestamp).getHours() !== new Date(messages[messages.indexOf(item) - 1].timestamp).getHours();
    
    // Determine if we should show the status
    const showStatus = isUser && item.id === messages[messages.length - 1].id;
    
    if (item.type === 'typing') {
      return (
        <View style={styles.messageContainer}>
          <Image
            source={{ uri: traveler?.avatar || '' }}
            style={styles.avatar}
          />
          <View style={styles.messageContent}>
            <TypingIndicator />
          </View>
        </View>
      );
    }

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
                    {traveler.avatar ? (
                      <Image source={{ uri: traveler.avatar }} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.avatarText}>{traveler.name[0]}</Text>
                    )}
                  </View>
                  {traveler.isActive && <View style={styles.activeIndicator} />}
                </View>
                
                <View style={styles.travelerTextInfo}>
                  <Text style={styles.travelerName} numberOfLines={1}>{traveler.name}</Text>
                  <Text style={styles.travelerStatus}>
                    {traveler.isActive ? 'Active now' : traveler.lastSeen}
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
              {renderTypingIndicator()}
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
                  onChangeText={setMessageText}
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
