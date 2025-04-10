import { useTranslation } from "react-i18next";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TravelerHomeScreen() {
  const { t } = useTranslation();

  // Mock data for demonstration
  const nearbyTranslators = [
    { id: 1, name: "Emma Chen", language: "Chinese", rating: 4.8, distance: "0.5 km", online: true },
    { id: 2, name: "Miguel Lopez", language: "Spanish", rating: 4.9, distance: "1.2 km", online: true },
    { id: 3, name: "Yuki Tanaka", language: "Japanese", rating: 4.7, distance: "2.0 km", online: false },
    { id: 4, name: "Hans Mueller", language: "German", rating: 4.6, distance: "2.5 km", online: true },
  ];

  // Mock popular destinations
  const popularDestinations = [
    { id: 1, name: "Tokyo, Japan", translators: 28 },
    { id: 2, name: "Paris, France", translators: 22 },
    { id: 3, name: "Barcelona, Spain", translators: 19 },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{t("home.greeting")}</Text>
        <Text style={styles.title}>{t("tabs.home")}</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder={t("home.searchPlaceholder")}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={20} color="#007BFF" />
        </TouchableOpacity>
      </View>

      {/* Nearby Translators Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("home.nearbyTranslators")}</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {nearbyTranslators.map(translator => (
          <TouchableOpacity key={translator.id} style={styles.translatorCard}>
            <View style={styles.translatorAvatar}>
              <Text style={styles.translatorInitial}>{translator.name[0]}</Text>
            </View>
            <View style={styles.translatorInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.translatorName}>{translator.name}</Text>
                <View style={[styles.statusIndicator, 
                  translator.online ? styles.statusOnline : styles.statusOffline]} />
              </View>
              <Text style={styles.translatorLanguage}>{translator.language}</Text>
              <View style={styles.translatorMeta}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.translatorRating}>{translator.rating}</Text>
                <Text style={styles.translatorDistance}>{translator.distance}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Popular Destinations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Destinations</Text>
        
        {popularDestinations.map(destination => (
          <TouchableOpacity key={destination.id} style={styles.destinationCard}>
            <Ionicons name="location" size={24} color="#007BFF" />
            <View style={styles.destinationInfo}>
              <Text style={styles.destinationName}>{destination.name}</Text>
              <Text style={styles.destinationMeta}>
                {destination.translators} translators available
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("home.quickActions")}</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="chatbubbles" size={24} color="white" />
            </View>
            <Text style={styles.actionText}>{t("home.startChat")}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#F44336' }]}>
              <Ionicons name="heart" size={24} color="white" />
            </View>
            <Text style={styles.actionText}>{t("home.favorites")}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#2196F3' }]}>
              <Ionicons name="map" size={24} color="white" />
            </View>
            <Text style={styles.actionText}>Find Nearby</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#007BFF",
  },
  greeting: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginTop: -20,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 25,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#333",
  },
  filterButton: {
    backgroundColor: "white",
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  section: {
    padding: 20,
    backgroundColor: "white",
    margin: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  seeAllText: {
    color: "#007BFF",
    fontSize: 14,
  },
  translatorCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  translatorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007BFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  translatorInitial: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  translatorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  translatorName: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOnline: {
    backgroundColor: "#4CAF50",
  },
  statusOffline: {
    backgroundColor: "#bbb",
  },
  translatorLanguage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  translatorMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  translatorRating: {
    fontSize: 14,
    color: "#666",
    marginLeft: 3,
    marginRight: 10,
  },
  translatorDistance: {
    fontSize: 14,
    color: "#999",
  },
  destinationCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  destinationInfo: {
    flex: 1,
    marginLeft: 15,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  destinationMeta: {
    fontSize: 14,
    color: "#666",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    alignItems: "center",
    width: '30%',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    textAlign: "center",
  },
}); 