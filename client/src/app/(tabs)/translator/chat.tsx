import React, { useState, useEffect } from "react";
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
  RefreshControl
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useAuth } from "../../../context/AuthContext";

// Define proper types for our data
interface ChatData {
  id: string;
  travelerName: string;
  lastMessage: string;
  unreadCount: number;
  time: string;
  avatar: string | null;
  isActive: boolean;
  languages: string[];
  lastSeen?: string;
}

export default function TranslatorChatScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [scrollY] = useState(new Animated.Value(0));
  
  // Mock data for chats
  const [chats, setChats] = useState<ChatData[]>([
    {
      id: "1",
      travelerName: "John Smith",
      lastMessage: "What time should we meet tomorrow?",
      unreadCount: 2,
      time: "10:45 AM",
      avatar: null,
      isActive: true,
      languages: ["English", "French"],
      lastSeen: "Just now"
    },
    {
      id: "2",
      travelerName: "Maria Rodriguez",
      lastMessage: "Thank you for your help yesterday!",
      unreadCount: 0,
      time: "Yesterday",
      avatar: null,
      isActive: false,
      languages: ["Spanish", "French"],
      lastSeen: "2 hours ago"
    },
    {
      id: "3",
      travelerName: "Michael Chen",
      lastMessage: "I'm at the entrance of the museum",
      unreadCount: 0,
      time: "Yesterday",
      avatar: null,
      isActive: true,
      languages: ["Chinese", "French", "English"],
      lastSeen: "5 minutes ago"
    },
    {
      id: "4",
      travelerName: "Sarah Johnson",
      lastMessage: "Can you recommend a good restaurant?",
      unreadCount: 0,
      time: "Monday",
      avatar: null,
      isActive: false,
      languages: ["English", "French"],
      lastSeen: "3 days ago"
    },
    {
      id: "5",
      travelerName: "Akira Tanaka",
      lastMessage: "I'll be waiting at the hotel lobby",
      unreadCount: 1,
      time: "11:22 AM",
      avatar: null,
      isActive: true,
      languages: ["Japanese", "English"],
      lastSeen: "Just now"
    }
  ]);

  // Animation value for header
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate a network request
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Filter chats based on search query and active filter
  const filteredChats = chats.filter(chat => {
    // Text search filter
    const matchesSearch = 
      searchQuery === "" ||
      chat.travelerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesFilter = 
      activeFilter === "all" ||
      (activeFilter === "active" && chat.isActive) ||
      (activeFilter === "unread" && chat.unreadCount > 0) ||
      (activeFilter === "archived" && false); // No archived chats in mock data
    
    return matchesSearch && matchesFilter;
  });

  // Handle chat item press
  const handleChatPress = (chatId: string) => {
    // Mark as read in a real app
    const updatedChats = chats.map(chat => 
      chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
    );
    setChats(updatedChats);
    
    // Navigate to chat detail view
    router.push(`/(translator)/${chatId}`);
  };

  // Render chat item
  const renderChatItem = ({ item }: { item: ChatData }) => (
    <Animated.View 
      style={{
        opacity: 1,
        transform: [{ scale: 1 }],
      }}
    >
      <TouchableOpacity 
        style={[
          styles.chatItem,
          item.unreadCount > 0 && styles.unreadChatItem
        ]}
        onPress={() => handleChatPress(item.id)}
        activeOpacity={0.7}
      >
        {/* Avatar with status indicator */}
        <View style={[styles.avatarContainer]}>
          <View style={[styles.avatar, item.isActive && styles.activeAvatar]}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{item.travelerName[0]}</Text>
            )}
          </View>
          {item.isActive && <View style={styles.activeIndicator} />}
        </View>
        
        {/* Chat details */}
        <View style={styles.chatDetails}>
          <View style={styles.chatHeader}>
            <Text style={styles.travelerName} numberOfLines={1}>
              {item.travelerName}
            </Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          
          <View style={styles.messageContainer}>
            <Text 
              style={[
                styles.messageText, 
                item.unreadCount > 0 && styles.unreadMessage
              ]}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>
            
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.languagesContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="translate" size={12} color="#888" style={{ marginRight: 3 }} />
              {item.languages.map((language, index) => (
                <Text key={index} style={styles.languageText}>
                  {language}{index < item.languages.length - 1 ? " • " : ""}
                </Text>
              ))}
            </View>
            
            {item.lastSeen && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                <Ionicons name="time-outline" size={12} color="#888" style={{ marginRight: 3 }} />
                <Text style={styles.lastSeenText}>{item.lastSeen}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

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
      
      <TouchableOpacity style={styles.emptyButton}>
        <Text style={styles.emptyButtonText}>Find Travelers</Text>
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
      
      {/* Chat List */}
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
      
      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <BlurView intensity={80} tint="light" style={styles.blurView}>
          <View style={styles.quickActionsContent}>
            <View style={styles.quickActionsHeader}>
              <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            </View>
            
            <View style={styles.quickActionsButtons}>
              <TouchableOpacity style={styles.quickActionButton}>
                <View style={styles.quickActionIcon}>
                  <Ionicons name="mail" size={20} color="#0066CC" />
                </View>
                <Text style={styles.quickActionText}>Templates</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionButton}>
                <View style={styles.quickActionIcon}>
                  <Ionicons name="alert-circle" size={20} color="#0066CC" />
                </View>
                <Text style={styles.quickActionText}>Support</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionButton}>
                <View style={styles.quickActionIcon}>
                  <Ionicons name="filter" size={20} color="#0066CC" />
                </View>
                <Text style={styles.quickActionText}>Filter</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionButton}>
                <View style={styles.quickActionIcon}>
                  <Ionicons name="person-add" size={20} color="#0066CC" />
                </View>
                <Text style={styles.quickActionText}>New Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
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
    paddingBottom: 50,
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
}); 