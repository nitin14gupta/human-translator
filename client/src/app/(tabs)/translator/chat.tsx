import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TranslatorChatScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data for chats
  const [chats, setChats] = useState([
    {
      id: "1",
      travelerName: "John Smith",
      lastMessage: "What time should we meet tomorrow?",
      unreadCount: 2,
      time: "10:45 AM",
      avatar: null,
      isActive: true,
      languages: ["English", "French"]
    },
    {
      id: "2",
      travelerName: "Maria Rodriguez",
      lastMessage: "Thank you for your help yesterday!",
      unreadCount: 0,
      time: "Yesterday",
      avatar: null,
      isActive: false,
      languages: ["Spanish", "French"]
    },
    {
      id: "3",
      travelerName: "Michael Chen",
      lastMessage: "I'm at the entrance of the museum",
      unreadCount: 0,
      time: "Yesterday",
      avatar: null,
      isActive: true,
      languages: ["Chinese", "French", "English"]
    },
    {
      id: "4",
      travelerName: "Sarah Johnson",
      lastMessage: "Can you recommend a good restaurant?",
      unreadCount: 0,
      time: "Monday",
      avatar: null,
      isActive: false,
      languages: ["English", "French"]
    }
  ]);

  // Filter chats based on search query
  const filteredChats = chats.filter(chat => 
    chat.travelerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle chat item press
  const handleChatPress = (chatId) => {
    // Navigate to chat detail
    console.log(`Navigate to chat ${chatId}`);
    // In a real app, you would navigate to a chat detail screen
  };

  // Render chat item
  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => handleChatPress(item.id)}
    >
      {/* Avatar */}
      <View style={[styles.avatar, item.isActive && styles.activeAvatar]}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{item.travelerName[0]}</Text>
        )}
        {item.isActive && <View style={styles.activeIndicator} />}
      </View>
      
      {/* Chat details */}
      <View style={styles.chatDetails}>
        <View style={styles.chatHeader}>
          <Text style={styles.travelerName}>{item.travelerName}</Text>
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
          {item.languages.map((language, index) => (
            <Text key={index} style={styles.languageText}>
              {language}{index < item.languages.length - 1 ? " • " : ""}
            </Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render empty list
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={60} color="#CCC" />
      <Text style={styles.emptyTitle}>No Conversations Yet</Text>
      <Text style={styles.emptyDescription}>
        Your conversations with travelers will appear here.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
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
        <TouchableOpacity style={[styles.filterButton, styles.activeFilter]}>
          <Text style={styles.activeFilterText}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Active</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Unread</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Archived</Text>
        </TouchableOpacity>
      </View>
      
      {/* Chat List */}
      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
      />
      
      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <View style={styles.quickActionsHeader}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        </View>
        
        <View style={styles.quickActionsButtons}>
          <TouchableOpacity style={styles.quickActionButton}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="mail" size={20} color="#007BFF" />
            </View>
            <Text style={styles.quickActionText}>Message Template</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="alert-circle" size={20} color="#007BFF" />
            </View>
            <Text style={styles.quickActionText}>Report Issue</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="archive" size={20} color="#007BFF" />
            </View>
            <Text style={styles.quickActionText}>Archive All</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f1f3f5",
  },
  activeFilter: {
    backgroundColor: "#007BFF",
  },
  filterText: {
    color: "#555",
    fontSize: 14,
  },
  activeFilterText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 15,
  },
  chatItem: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e6f3ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  activeAvatar: {
    borderWidth: 2,
    borderColor: "#007BFF",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007BFF",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#28a745",
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
    marginBottom: 4,
  },
  travelerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  timeText: {
    fontSize: 12,
    color: "#999",
  },
  messageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  unreadMessage: {
    fontWeight: "500",
    color: "#333",
  },
  unreadBadge: {
    backgroundColor: "#007BFF",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  unreadCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  languagesContainer: {
    flexDirection: "row",
  },
  languageText: {
    fontSize: 12,
    color: "#888",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
  quickActionsContainer: {
    backgroundColor: "white",
    marginTop: 10,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  quickActionsHeader: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  quickActionsButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  quickActionButton: {
    alignItems: "center",
    flex: 1,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  quickActionText: {
    fontSize: 12,
    color: "#555",
  },
}); 