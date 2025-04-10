import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TranslatorHomeScreen() {
  const { t } = useTranslation();
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("Paris, France");

  // Mock data for pending requests
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: "req1",
      travelerName: "John Smith",
      location: "Musée du Louvre",
      distance: "1.5 km",
      time: "10:30 AM",
      languages: ["English", "French"],
      urgent: true
    },
    {
      id: "req2",
      travelerName: "Maria Rodriguez",
      location: "Champs-Élysées",
      distance: "3.2 km",
      time: "12:45 PM",
      languages: ["Spanish", "French"],
      urgent: false
    }
  ]);

  // Mock data for upcoming sessions
  const [upcomingSessions, setUpcomingSessions] = useState([
    {
      id: "sess1",
      travelerName: "Michael Chen",
      location: "Eiffel Tower",
      date: "Tomorrow",
      time: "09:00 AM",
      languages: ["Chinese", "French", "English"],
      confirmed: true
    }
  ]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    
    // Simulate fetching data
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleAvailabilityToggle = (value) => {
    setIsAvailable(value);
    
    // Show confirmation message
    if (value) {
      Alert.alert(
        "You're Now Available",
        "You'll now receive translation requests from travelers in your area."
      );
    } else {
      Alert.alert(
        "You're Now Offline",
        "You won't receive new translation requests until you go online again."
      );
    }
  };

  const handleAcceptRequest = (requestId) => {
    // Filter out the accepted request and update state
    const updatedRequests = pendingRequests.filter(req => req.id !== requestId);
    setPendingRequests(updatedRequests);
    
    // Add to upcoming sessions
    const acceptedRequest = pendingRequests.find(req => req.id === requestId);
    if (acceptedRequest) {
      const newSession = {
        id: `sess${Date.now()}`,
        travelerName: acceptedRequest.travelerName,
        location: acceptedRequest.location,
        date: "Today",
        time: acceptedRequest.time,
        languages: acceptedRequest.languages,
        confirmed: true
      };
      
      setUpcomingSessions([...upcomingSessions, newSession]);
      
      Alert.alert(
        "Request Accepted",
        `You have accepted a translation request from ${acceptedRequest.travelerName}. They will be notified.`
      );
    }
  };

  const handleDeclineRequest = (requestId) => {
    // Filter out the declined request
    const updatedRequests = pendingRequests.filter(req => req.id !== requestId);
    setPendingRequests(updatedRequests);
    
    Alert.alert(
      "Request Declined",
      "The request has been declined and removed from your list."
    );
  };

  const handleSessionDetails = (sessionId) => {
    Alert.alert(
      "Session Details",
      "The full session details feature will be implemented in a future update."
    );
  };

  // Render a pending request item
  const renderRequestItem = (request) => (
    <TouchableOpacity 
      key={request.id} 
      style={styles.requestCard}
      onPress={() => handleSessionDetails(request.id)}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.travelerName}>{request.travelerName}</Text>
        {request.urgent && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>Urgent</Text>
          </View>
        )}
      </View>
      
      <View style={styles.requestDetail}>
        <Ionicons name="location-outline" size={16} color="#666" />
        <Text style={styles.requestDetailText}>{request.location}</Text>
        <Text style={styles.distanceText}>{request.distance}</Text>
      </View>
      
      <View style={styles.requestDetail}>
        <Ionicons name="time-outline" size={16} color="#666" />
        <Text style={styles.requestDetailText}>{request.time}</Text>
      </View>
      
      <View style={styles.requestDetail}>
        <MaterialIcons name="translate" size={16} color="#666" />
        <Text style={styles.requestDetailText}>
          {request.languages.join(" → ")}
        </Text>
      </View>
      
      <View style={styles.requestActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptRequest(request.id)}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleDeclineRequest(request.id)}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render an upcoming session item
  const renderSessionItem = (session) => (
    <TouchableOpacity 
      key={session.id} 
      style={styles.sessionCard}
      onPress={() => handleSessionDetails(session.id)}
    >
      <View style={styles.sessionHeader}>
        <Text style={styles.travelerName}>{session.travelerName}</Text>
        <View style={styles.confirmedBadge}>
          <Text style={styles.confirmedText}>Confirmed</Text>
        </View>
      </View>
      
      <View style={styles.sessionDetail}>
        <Ionicons name="location-outline" size={16} color="#666" />
        <Text style={styles.sessionDetailText}>{session.location}</Text>
      </View>
      
      <View style={styles.sessionDetail}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.sessionDetailText}>{session.date}, {session.time}</Text>
      </View>
      
      <View style={styles.sessionDetail}>
        <MaterialIcons name="translate" size={16} color="#666" />
        <Text style={styles.sessionDetailText}>
          {session.languages.join(" → ")}
        </Text>
      </View>
      
      <TouchableOpacity style={styles.viewDetailsButton}>
        <Text style={styles.viewDetailsText}>View Details</Text>
        <Ionicons name="chevron-forward" size={16} color="#007BFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render empty state for requests
  const renderEmptyRequests = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-outline" size={40} color="#CCC" />
      <Text style={styles.emptyTitle}>No Pending Requests</Text>
      <Text style={styles.emptyDescription}>
        New translation requests will appear here when travelers need your help.
      </Text>
    </View>
  );

  // Render empty state for sessions
  const renderEmptySessions = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={40} color="#CCC" />
      <Text style={styles.emptyTitle}>No Upcoming Sessions</Text>
      <Text style={styles.emptyDescription}>
        Your scheduled translation sessions will appear here.
      </Text>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Translator Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusLeft}>
          <Text style={styles.statusTitle}>
            {isAvailable ? "You're Available" : "You're Offline"}
          </Text>
          <Text style={styles.statusDescription}>
            {isAvailable 
              ? "Receiving translation requests" 
              : "Not receiving new requests"}
          </Text>
        </View>
        <Switch
          value={isAvailable}
          onValueChange={handleAvailabilityToggle}
          trackColor={{ false: "#ddd", true: "#bbd6ff" }}
          thumbColor={isAvailable ? "#007BFF" : "#f4f3f4"}
        />
      </View>

      {/* Current Location */}
      <View style={styles.locationContainer}>
        <Ionicons name="location" size={20} color="#007BFF" />
        <Text style={styles.locationText}>Current location: </Text>
        <Text style={styles.locationValue}>{currentLocation}</Text>
        <TouchableOpacity style={styles.locationUpdate}>
          <Text style={styles.locationUpdateText}>Update</Text>
        </TouchableOpacity>
      </View>
      
      {/* Income Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>€450</Text>
            <Text style={styles.summaryLabel}>This Week</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>48</Text>
            <Text style={styles.summaryLabel}>Total Sessions</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>4.8</Text>
            <Text style={styles.summaryLabel}>Rating</Text>
          </View>
        </View>
      </View>

      {/* Pending Translation Requests */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Pending Requests</Text>
        {pendingRequests.length > 0 ? (
          pendingRequests.map(renderRequestItem)
        ) : (
          renderEmptyRequests()
        )}
      </View>

      {/* Upcoming Sessions */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
        {upcomingSessions.length > 0 ? (
          upcomingSessions.map(renderSessionItem)
        ) : (
          renderEmptySessions()
        )}
      </View>
      
      {/* Marketing Section */}
      <TouchableOpacity style={styles.marketingCard}>
        <View style={styles.marketingContent}>
          <Text style={styles.marketingTitle}>Boost Your Visibility</Text>
          <Text style={styles.marketingDescription}>
            Enhance your profile and get more translation requests with a premium subscription.
          </Text>
        </View>
        <TouchableOpacity style={styles.marketingButton}>
          <Text style={styles.marketingButtonText}>Learn More</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statusLeft: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f7ff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 5,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  locationUpdate: {
    marginLeft: "auto",
  },
  locationUpdateText: {
    color: "#007BFF",
    fontSize: 14,
    fontWeight: "500",
  },
  summaryCard: {
    backgroundColor: "white",
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007BFF",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
  },
  summaryDivider: {
    width: 1,
    height: "100%",
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
  requestCard: {
    backgroundColor: "white",
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  travelerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  urgentBadge: {
    backgroundColor: "#f8d7da",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  urgentText: {
    color: "#dc3545",
    fontSize: 12,
    fontWeight: "500",
  },
  requestDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  requestDetailText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 6,
    flex: 1,
  },
  distanceText: {
    fontSize: 14,
    color: "#007BFF",
    fontWeight: "500",
  },
  requestActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#007BFF",
    marginRight: 5,
  },
  acceptButtonText: {
    color: "white",
    fontWeight: "500",
  },
  declineButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
    marginLeft: 5,
  },
  declineButtonText: {
    color: "#555",
  },
  sessionCard: {
    backgroundColor: "white",
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  confirmedBadge: {
    backgroundColor: "#d4edda",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  confirmedText: {
    color: "#28a745",
    fontSize: 12,
    fontWeight: "500",
  },
  sessionDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  sessionDetailText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 6,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 6,
  },
  viewDetailsText: {
    color: "#007BFF",
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    padding: 25,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
  marketingCard: {
    backgroundColor: "#f0f7ff",
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 25,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  marketingContent: {
    marginBottom: 10,
  },
  marketingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  marketingDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 18,
  },
  marketingButton: {
    alignSelf: "flex-start",
    backgroundColor: "#007BFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  marketingButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
}); 