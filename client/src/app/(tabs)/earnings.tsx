import { useTranslation } from "react-i18next";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EarningsScreen() {
  const { t } = useTranslation();

  // Mock data for demonstration
  const earningsData = [
    { date: "2023-06-01", amount: 45.50, status: "Paid" },
    { date: "2023-06-15", amount: 32.75, status: "Paid" },
    { date: "2023-06-28", amount: 60.00, status: "Pending" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>{t("earnings.currentBalance")}</Text>
        <Text style={styles.balanceAmount}>$138.25</Text>
        <View style={styles.balanceInfo}>
          <Ionicons name="information-circle-outline" size={16} color="#666" />
          <Text style={styles.balanceInfoText}>{t("earnings.processingTime")}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("earnings.history")}</Text>
        
        <ScrollView style={styles.historyList}>
          {earningsData.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyItemLeft}>
                <Text style={styles.historyItemDate}>{item.date}</Text>
                <Text style={styles.historyItemStatus}>{item.status}</Text>
              </View>
              <Text style={styles.historyItemAmount}>${item.amount.toFixed(2)}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.disclaimer}>{t("earnings.disclaimer")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  balanceCard: {
    backgroundColor: "#007BFF",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  balanceLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 10,
  },
  balanceInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  balanceInfoText: {
    color: "white",
    fontSize: 12,
    marginLeft: 5,
  },
  section: {
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
    marginBottom: 15,
  },
  historyList: {
    maxHeight: 300,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  historyItemLeft: {
    flex: 1,
  },
  historyItemDate: {
    fontSize: 15,
    color: "#333",
    marginBottom: 4,
  },
  historyItemStatus: {
    fontSize: 13,
    color: "#666",
  },
  historyItemAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007BFF",
  },
  disclaimer: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
  },
}); 