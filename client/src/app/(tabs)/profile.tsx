import { useTranslation } from "react-i18next";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>XA</Text>
        </View>
        <Text style={styles.title}>{t("tabs.profile")}</Text>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="pencil" size={20} color="#007BFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        <Text style={styles.text}>Profile details will be implemented here</Text>
      </View>
      
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <Text style={styles.text}>Settings options will be implemented here</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007BFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  editButton: {
    padding: 10,
  },
  infoSection: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#666",
  },
}); 