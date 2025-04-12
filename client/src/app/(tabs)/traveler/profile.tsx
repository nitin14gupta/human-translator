import { useTranslation } from "react-i18next";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Switch, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function TravelerProfileScreen() {
  const { t } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  // Mock user data
  const user = {
    name: "John Traveler",
    email: "john.traveler@example.com",
    location: "New York, USA",
    preferred_language: "English",
    memberSince: "June 2023",
    completed_sessions: 12
  };

  // Settings sections
  const accountSettings = [
    { 
      icon: "person-outline", 
      title: "Edit Profile", 
      description: "Update your personal information",
      action: "navigate"
    },
    { 
      icon: "language-outline", 
      title: "Language Preferences", 
      description: "Set your preferred languages",
      action: "navigate"
    },
    { 
      icon: "notifications-outline", 
      title: "Notifications", 
      description: "Control push notifications",
      action: "toggle",
      value: notificationsEnabled,
      setValue: setNotificationsEnabled
    },
    { 
      icon: "location-outline", 
      title: "Location Services", 
      description: "Allow location access for finding nearby translators",
      action: "toggle",
      value: locationEnabled,
      setValue: setLocationEnabled
    }
  ];

  const supportSettings = [
    { 
      icon: "help-circle-outline", 
      title: "Help Center", 
      description: "Get help with using the app",
      action: "navigate"
    },
    { 
      icon: "chatbubble-ellipses-outline", 
      title: "Contact Support", 
      description: "Reach out to our team",
      action: "navigate"
    },
    { 
      icon: "star-outline", 
      title: "Rate the App", 
      description: "Share your feedback",
      action: "navigate"
    }
  ];

  // Render settings item
  const renderSettingItem = (item, index, isLast) => (
    <TouchableOpacity 
      key={index} 
      style={[styles.settingItem, isLast ? null : styles.settingItemBorder]}
      disabled={item.action === "toggle"}
    >
      <View style={styles.settingIconContainer}>
        <Ionicons name={item.icon} size={24} color="#007BFF" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <Text style={styles.settingDescription}>{item.description}</Text>
      </View>
      {item.action === "navigate" && (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      )}
      {item.action === "toggle" && (
        <Switch
          value={item.value}
          onValueChange={item.setValue}
          trackColor={{ false: "#ddd", true: "#bbd6ff" }}
          thumbColor={item.value ? "#007BFF" : "#f4f3f4"}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header Section */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <Text style={styles.profileInitial}>{user.name[0]}</Text>
          </View>
          <TouchableOpacity style={styles.editImageButton}>
            <Ionicons name="camera" size={18} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userLocation}>
          <Ionicons name="location-outline" size={16} color="#666" /> {user.location}
        </Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.completed_sessions}</Text>
          <Text style={styles.statLabel}>Completed Sessions</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.preferred_language}</Text>
          <Text style={styles.statLabel}>Preferred Language</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.memberSince}</Text>
          <Text style={styles.statLabel}>Member Since</Text>
        </View>
      </View>

      {/* Travel Preferences */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Travel Preferences</Text>
        <TouchableOpacity style={styles.preferenceCard}>
          <View style={styles.preferenceIconContainer}>
            <Ionicons name="map-outline" size={24} color="#007BFF" />
          </View>
          <View style={styles.preferenceContent}>
            <Text style={styles.preferenceTitle}>Saved Destinations</Text>
            <Text style={styles.preferenceDescription}>Manage your saved travel destinations</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.preferenceCard}>
          <View style={styles.preferenceIconContainer}>
            <Ionicons name="people-outline" size={24} color="#007BFF" />
          </View>
          <View style={styles.preferenceContent}>
            <Text style={styles.preferenceTitle}>Preferred Translators</Text>
            <Text style={styles.preferenceDescription}>View and manage your favorite translators</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Account Settings */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.settingsContainer}>
          {accountSettings.map((item, index) => 
            renderSettingItem(item, index, index === accountSettings.length - 1)
          )}
        </View>
      </View>

      {/* Support & Help */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Support & Help</Text>
        <View style={styles.settingsContainer}>
          {supportSettings.map((item, index) => 
            renderSettingItem(item, index, index === supportSettings.length - 1)
          )}
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* App Version */}
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#007BFF",
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: "center",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  profileInitial: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#007BFF",
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007BFF",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  userLocation: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    margin: 15,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 15,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "#eee",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 15,
    marginBottom: 10,
  },
  preferenceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  preferenceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 14,
    color: "#666",
  },
  settingsContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE5E5",
    marginHorizontal: 15,
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 10,
    padding: 15,
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
  versionText: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginBottom: 30,
  },
}); 