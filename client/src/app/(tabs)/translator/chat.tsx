import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  Platform,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useAuth } from "../../../context/AuthContext";
import { getConversations, Conversation, markConversationAsRead } from "../../../services/api";
import socketService from "../../../services/socketService";

export default function TranslatorChatScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [scrollY] = useState(new Animated.Value(0));
  const [chats, setChats] = useState<Conversation[]>([]);
  const [filteredChats, setFilteredChats] = useState<Conversation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

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
      // Disconnect socket when component unmounts
      socketService.disconnect();
    };
  }, [user]);

  // Handle online status updates
  useEffect(() => {
    if (!socketConnected || !user?.id) return;
    
    const handleOnlineStatus = (userId: string, isOnline: boolean) => {
      setChats((prevChats) => 
        prevChats.map((chat) => 
          chat.id === userId ? { ...chat, is_online: isOnline } : chat
        )
      );
    };
    
    const unsubscribe = socketService.onOnlineStatusChange(handleOnlineStatus);
    return () => unsubscribe();
  }, [socketConnected, user]);

  // Handle new messages
  useEffect(() => {
    if (!socketConnected || !user?.id) return;
    
    const handleNewMessage = (message: any) => {
      const isIncoming = message.sender_id !== user.id;
      
      if (isIncoming) {
        // Update the chat list with the new message
        setChats((prevChats) => {
          const conversationId = message.sender_id;
          const updatedChats = prevChats.map((chat) => {
            if (chat.id === conversationId) {
              return {
                ...chat,
                last_message: message.content,
                last_message_time: message.created_at,
                unread_count: chat.unread_count + 1
              };
            }
            return chat;
          });
          
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
      setError(null);
      const conversations = await getConversations();
      setChats(conversations);
      
      // Apply filters
      filterChats(conversations, searchQuery, activeFilter);
      
      return conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError("Failed to load conversations. Please try again.");
      return [];
    }
  }, [searchQuery, activeFilter]);

  // Initial load
  useEffect(() => {
    const loadChats = async () => {
      setLoading(true);
      await fetchConversations();
      setLoading(false);
    };
    
    loadChats();
  }, [fetchConversations]);

  // Filter function
  const filterChats = (chatList: Conversation[], query: string, filter: string) => {
    // Filter by search query
    let filtered = chatList;
    
    if (query.trim() !== "") {
      filtered = filtered.filter(chat => 
        chat.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filter === "active") {
      filtered = filtered.filter(chat => chat.is_online);
    } else if (filter === "unread") {
      filtered = filtered.filter(chat => chat.unread_count > 0);
    }
    // The "archived" filter would be implemented here if needed
    
    setFilteredChats(filtered);
  };

  // Update filters when search query or active filter changes
  useEffect(() => {
    filterChats(chats, searchQuery, activeFilter);
  }, [searchQuery, activeFilter, chats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  // Handle chat item press
  const handleChatPress = async (chatId: string) => {
    try {
      // Mark conversation as read
      if (chatId) {
        await markConversationAsRead(chatId);
        
        // Update unread count locally
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === chatId ? { ...chat, unread_count: 0 } : chat
          )
        );
      }
      
      // Navigate to chat detail view
      router.push(`/(translator)/${chatId}`);
    } catch (error) {
      console.error("Error marking conversation as read:", error);
    }
  };

  // Animation value for header
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // Render chat item
  const renderChatItem = ({ item }: { item: Conversation }) => (
    <Animated.View 
      style={{
        opacity: 1,
        transform: [{ scale: 1 }],
      }}
    >
      <TouchableOpacity 
        style={[
          styles.chatItem,
          item.unread_count > 0 && styles.unreadChatItem
        ]}
        onPress={() => handleChatPress(item.id)}
        activeOpacity={0.7}
      >
        {/* Avatar with status indicator */}
        <View style={[styles.avatarContainer]}>
          <View style={[styles.avatar, item.is_online && styles.activeAvatar]}>
            {item.photo_url ? (
              <Image source={{ uri: item.photo_url }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            )}
          </View>
          {item.is_online && <View style={styles.activeIndicator} />}
        </View>
        
        {/* Chat details */}
        <View style={styles.chatDetails}>
          <View style={styles.chatHeader}>
            <Text style={styles.travelerName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.timeText}>{formatTimeAgo(item.last_message_time)}</Text>
          </View>
          
          <View style={styles.messageContainer}>
            <Text 
              style={[
                styles.messageText, 
                item.unread_count > 0 && styles.unreadMessage
              ]}
              numberOfLines={1}
            >
              {item.last_message}
            </Text>
            
            {item.unread_count > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unread_count}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.languagesContainer}>
            {item.booking_id && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="calendar-outline" size={12} color="#888" style={{ marginRight: 3 }} />
                <Text style={styles.languageText}>Has Booking</Text>
              </View>
            )}
            
            {item.is_online ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                <Ionicons name="ellipse" size={8} color="#4CAF50" style={{ marginRight: 3 }} />
                <Text style={styles.lastSeenText}>Online</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                <Ionicons name="time-outline" size={12} color="#888" style={{ marginRight: 3 }} />
                <Text style={styles.lastSeenText}>Offline</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  // Helper function to format time
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 60) {
      return 'Just now';
    } else if (diffMin < 60) {
      return `${diffMin}m ago`;
    } else if (diffHour < 24) {
      return `${diffHour}h ago`;
    } else if (diffDay === 1) {
      return 'Yesterday';
    } else if (diffDay < 7) {
      return `${diffDay}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Render empty list
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="chatbubbles-outline" size={60} color="#0066CC" />
      </View>
      <Text style={styles.emptyTitle}>No Conversations Yet</Text>
      <Text style={styles.emptyDescription}>
        Your conversations with travelers will appear here. Send a message to get started.
      </Text>
      
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => router.push('/(tabs)/translator/requests')}
      >
        <Text style={styles.emptyButtonText}>View Requests</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.9)']}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>
            {filteredChats.length > 0 
              ? `${filteredChats.length} conversations` 
              : "No conversations yet"}
          </Text>
        </LinearGradient>
      </Animated.View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
          >
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Chat Filters */}
      <View style={styles.filtersContainer}>
        {["all", "active", "unread", "archived"].map((filter) => (
          <TouchableOpacity 
            key={filter}
            style={[
              styles.filterButton, 
              activeFilter === filter && styles.activeFilter
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text 
              style={[
                styles.filterText,
                activeFilter === filter && styles.activeFilterText
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#ef4444" />
          <Text style={styles.errorTitle}>Error Loading Conversations</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Chat List */
        <Animated.FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#0066CC"
              colors={["#0066CC"]}
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 10,
    backgroundColor: 'white',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 5,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f1f3f5",
  },
  activeFilter: {
    backgroundColor: "#0066CC",
  },
  filterText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "500",
  },
  activeFilterText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 80,
  },
  chatItem: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadChatItem: {
    backgroundColor: "#f0f7ff",
    borderLeftWidth: 4,
    borderLeftColor: "#0066CC",
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e6f3ff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeAvatar: {
    borderWidth: 2,
    borderColor: "#0066CC",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0066CC",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "white",
  },
  chatDetails: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  travelerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: "#999",
  },
  messageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  messageText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  unreadMessage: {
    fontWeight: "600",
    color: "#333",
  },
  unreadBadge: {
    backgroundColor: "#0066CC",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    marginLeft: 10,
  },
  unreadCount: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  languagesContainer: {
    flexDirection: "row",
    alignItems: 'center',
  },
  languageText: {
    fontSize: 12,
    color: "#888",
  },
  lastSeenText: {
    fontSize: 12,
    color: "#888",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    marginTop: 50,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: "#0066CC",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
  quickActionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  blurView: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    borderTopWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  quickActionsContent: {
    paddingVertical: 15,
  },
  quickActionsHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  quickActionsButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  quickActionButton: {
    alignItems: "center",
    flex: 1,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 12,
    color: "#555",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 