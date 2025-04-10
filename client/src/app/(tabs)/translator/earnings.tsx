import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function TranslatorEarningsScreen() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions"); // "transactions" or "payouts"
  const [timeRange, setTimeRange] = useState("week"); // "week", "month", "year", "all"

  // Mock data for earnings
  const [earnings, setEarnings] = useState({
    currentBalance: 450,
    currency: "EUR",
    weeklyEarnings: 180,
    monthlyEarnings: 780,
    yearlyEarnings: 3840,
    pendingPayouts: 450,
    nextPayoutDate: "Friday, June 16",
    averageRating: 4.8,
    totalSessions: 48
  });

  // Mock data for transactions
  const [transactions, setTransactions] = useState([
    {
      id: "tx1",
      travelerName: "John Smith",
      type: "session",
      amount: 85,
      date: "2023-06-12",
      time: "11:30 AM - 1:30 PM",
      status: "completed",
      location: "Musée du Louvre"
    },
    {
      id: "tx2",
      travelerName: "Maria Rodriguez",
      type: "session",
      amount: 60,
      date: "2023-06-10",
      time: "2:00 PM - 3:30 PM",
      status: "completed",
      location: "Champs-Élysées"
    },
    {
      id: "tx3",
      travelerName: "Michael Chen",
      type: "session",
      amount: 35,
      date: "2023-06-08",
      time: "10:00 AM - 11:00 AM",
      status: "completed",
      location: "Eiffel Tower"
    },
    {
      id: "tx4",
      travelerName: "System",
      type: "payout",
      amount: -380,
      date: "2023-06-02",
      time: "",
      status: "processed",
      payoutMethod: "Bank Transfer"
    },
    {
      id: "tx5",
      travelerName: "Sarah Johnson",
      type: "session",
      amount: 110,
      date: "2023-05-28",
      time: "9:30 AM - 12:00 PM",
      status: "completed",
      location: "Notre-Dame Cathedral"
    }
  ]);

  // Mock data for payouts
  const [payouts, setPayouts] = useState([
    {
      id: "pay1",
      amount: 380,
      date: "2023-06-02",
      method: "Bank Transfer",
      status: "processed",
      reference: "PAY-2023060201"
    },
    {
      id: "pay2",
      amount: 450,
      date: "2023-05-26",
      method: "Bank Transfer",
      status: "processed",
      reference: "PAY-2023052601"
    },
    {
      id: "pay3",
      amount: 520,
      date: "2023-05-19",
      method: "Bank Transfer",
      status: "processed",
      reference: "PAY-2023051901"
    }
  ]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    
    // Simulate fetching data
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Filter transactions based on time range
  const getFilteredTransactions = () => {
    const today = new Date();
    let cutoffDate = new Date();
    
    switch (timeRange) {
      case "week":
        cutoffDate.setDate(today.getDate() - 7);
        break;
      case "month":
        cutoffDate.setMonth(today.getMonth() - 1);
        break;
      case "year":
        cutoffDate.setFullYear(today.getFullYear() - 1);
        break;
      case "all":
        return transactions;
    }
    
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= cutoffDate;
    });
  };

  // Render a transaction item
  const renderTransactionItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.transactionItem}>
      {/* Icon based on transaction type */}
      <View style={[
        styles.transactionIcon, 
        item.type === "payout" ? styles.payoutIcon : styles.sessionIcon
      ]}>
        <Ionicons 
          name={item.type === "payout" ? "arrow-down" : "cash-outline"} 
          size={20} 
          color={item.type === "payout" ? "#6c757d" : "#007BFF"} 
        />
      </View>
      
      {/* Transaction details */}
      <View style={styles.transactionDetails}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionTitle}>
            {item.type === "session" 
              ? `Session with ${item.travelerName}` 
              : "Payout to Bank Account"}
          </Text>
          <Text style={[
            styles.transactionAmount,
            item.type === "payout" ? styles.payoutAmount : styles.incomeAmount
          ]}>
            {item.type === "payout" ? "-" : "+"}€{Math.abs(item.amount)}
          </Text>
        </View>
        
        <View style={styles.transactionMeta}>
          <Text style={styles.transactionDate}>
            {item.date}{item.time ? `, ${item.time}` : ""}
          </Text>
          
          <View style={styles.transactionStatus}>
            <View style={[
              styles.statusDot,
              item.status === "completed" || item.status === "processed" 
                ? styles.completedDot 
                : styles.pendingDot
            ]} />
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        
        {item.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        )}
        
        {item.payoutMethod && (
          <View style={styles.locationContainer}>
            <Ionicons name="card-outline" size={14} color="#666" />
            <Text style={styles.locationText}>{item.payoutMethod}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Render a payout item
  const renderPayoutItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.payoutItem}>
      <View style={styles.payoutIconContainer}>
        <Ionicons name="card-outline" size={24} color="#6c757d" />
      </View>
      
      <View style={styles.payoutDetails}>
        <Text style={styles.payoutTitle}>Payout to Bank Account</Text>
        <Text style={styles.payoutReference}>{item.reference}</Text>
        
        <View style={styles.payoutMeta}>
          <Text style={styles.payoutDate}>{item.date}</Text>
          <View style={styles.payoutStatusContainer}>
            <View style={[
              styles.statusDot,
              item.status === "processed" ? styles.completedDot : styles.pendingDot
            ]} />
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.payoutAmount}>€{item.amount}</Text>
    </TouchableOpacity>
  );

  // Render empty transaction list
  const renderEmptyTransactions = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cash-outline" size={50} color="#CCC" />
      <Text style={styles.emptyTitle}>No Transactions</Text>
      <Text style={styles.emptyDescription}>
        Your earning transactions will appear here.
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
      {/* Earnings Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>{t("earnings.currentBalance")}</Text>
          <Text style={styles.balanceAmount}>€{earnings.currentBalance}</Text>
          <Text style={styles.balanceNote}>{t("earnings.processingTime")}</Text>
        </View>
        
        <View style={styles.nextPayoutSection}>
          <View style={styles.payoutDateContainer}>
            <Ionicons name="calendar-outline" size={18} color="#666" />
            <Text style={styles.payoutDateText}>
              Next payout: {earnings.nextPayoutDate}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.withdrawButton}>
            <Text style={styles.withdrawButtonText}>Withdraw Manually</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Stats Quick View */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <Text style={styles.statsValue}>€{earnings.weeklyEarnings}</Text>
          <Text style={styles.statsLabel}>This Week</Text>
        </View>
        
        <View style={styles.statsCard}>
          <Text style={styles.statsValue}>€{earnings.monthlyEarnings}</Text>
          <Text style={styles.statsLabel}>This Month</Text>
        </View>
        
        <View style={styles.statsCard}>
          <Text style={styles.statsValue}>{earnings.totalSessions}</Text>
          <Text style={styles.statsLabel}>Sessions</Text>
        </View>
      </View>
      
      {/* Tabs for Transactions and Payouts */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === "transactions" && styles.activeTab]}
          onPress={() => setActiveTab("transactions")}
        >
          <Text style={[
            styles.tabText, 
            activeTab === "transactions" && styles.activeTabText
          ]}>
            Transactions
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === "payouts" && styles.activeTab]}
          onPress={() => setActiveTab("payouts")}
        >
          <Text style={[
            styles.tabText, 
            activeTab === "payouts" && styles.activeTabText
          ]}>
            Payouts
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Time Range Filter (for Transactions) */}
      {activeTab === "transactions" && (
        <View style={styles.timeRangeContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={[styles.timeButton, timeRange === "week" && styles.activeTimeButton]}
              onPress={() => setTimeRange("week")}
            >
              <Text style={[
                styles.timeButtonText, 
                timeRange === "week" && styles.activeTimeButtonText
              ]}>
                This Week
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.timeButton, timeRange === "month" && styles.activeTimeButton]}
              onPress={() => setTimeRange("month")}
            >
              <Text style={[
                styles.timeButtonText, 
                timeRange === "month" && styles.activeTimeButtonText
              ]}>
                This Month
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.timeButton, timeRange === "year" && styles.activeTimeButton]}
              onPress={() => setTimeRange("year")}
            >
              <Text style={[
                styles.timeButtonText, 
                timeRange === "year" && styles.activeTimeButtonText
              ]}>
                This Year
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.timeButton, timeRange === "all" && styles.activeTimeButton]}
              onPress={() => setTimeRange("all")}
            >
              <Text style={[
                styles.timeButtonText, 
                timeRange === "all" && styles.activeTimeButtonText
              ]}>
                All Time
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
      
      {/* Transactions List */}
      {activeTab === "transactions" && (
        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>
            {t("earnings.history")}
          </Text>
          
          {getFilteredTransactions().length > 0 ? (
            getFilteredTransactions().map(transaction => (
              <View key={transaction.id}>
                {renderTransactionItem({ item: transaction })}
              </View>
            ))
          ) : (
            renderEmptyTransactions()
          )}
          
          {transactions.length > 5 && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>
                {t("earnings.viewAll")}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#007BFF" />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Payouts List */}
      {activeTab === "payouts" && (
        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>
            Payout History
          </Text>
          
          {payouts.length > 0 ? (
            payouts.map(payout => (
              <View key={payout.id}>
                {renderPayoutItem({ item: payout })}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="card-outline" size={50} color="#CCC" />
              <Text style={styles.emptyTitle}>No Payouts</Text>
              <Text style={styles.emptyDescription}>
                Your payout history will appear here.
              </Text>
            </View>
          )}
        </View>
      )}
      
      {/* Payment Methods Section */}
      <View style={styles.paymentMethodsContainer}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        
        <TouchableOpacity style={styles.addPaymentButton}>
          <Ionicons name="add-circle" size={22} color="#007BFF" />
          <Text style={styles.addPaymentText}>Add Payment Method</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.paymentMethodItem}>
          <Ionicons name="card-outline" size={24} color="#333" />
          <View style={styles.paymentMethodDetails}>
            <Text style={styles.paymentMethodTitle}>Bank Account</Text>
            <Text style={styles.paymentMethodDescription}>
              IBAN ending in •••• 4567
            </Text>
          </View>
          <Text style={styles.paymentMethodDefault}>Default</Text>
        </TouchableOpacity>
      </View>
      
      {/* Disclaimer */}
      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          {t("earnings.disclaimer")}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  summaryCard: {
    backgroundColor: "#007BFF",
    borderRadius: 15,
    margin: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceSection: {
    marginBottom: 20,
  },
  balanceLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginBottom: 5,
  },
  balanceAmount: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 5,
  },
  balanceNote: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
  },
  nextPayoutSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    padding: 12,
  },
  payoutDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  payoutDateText: {
    color: "white",
    fontSize: 12,
    marginLeft: 6,
  },
  withdrawButton: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  withdrawButtonText: {
    color: "#007BFF",
    fontSize: 12,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginBottom: 20,
  },
  statsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: "#777",
  },
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#f1f3f5",
    borderRadius: 10,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#007BFF",
    fontWeight: "500",
  },
  timeRangeContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
  timeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f1f3f5",
  },
  activeTimeButton: {
    backgroundColor: "#e6f3ff",
  },
  timeButtonText: {
    fontSize: 14,
    color: "#666",
  },
  activeTimeButtonText: {
    color: "#007BFF",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  transactionsContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  transactionItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  sessionIcon: {
    backgroundColor: "#e6f3ff",
  },
  payoutIcon: {
    backgroundColor: "#f1f3f5",
  },
  transactionDetails: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  incomeAmount: {
    color: "#28a745",
  },
  payoutAmount: {
    color: "#6c757d",
  },
  transactionMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  transactionDate: {
    fontSize: 12,
    color: "#777",
  },
  transactionStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  completedDot: {
    backgroundColor: "#28a745",
  },
  pendingDot: {
    backgroundColor: "#ffc107",
  },
  statusText: {
    fontSize: 12,
    color: "#666",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  payoutItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    alignItems: "center",
  },
  payoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f3f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  payoutDetails: {
    flex: 1,
  },
  payoutTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  payoutReference: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  payoutMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  payoutDate: {
    fontSize: 12,
    color: "#777",
  },
  payoutStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
//   payoutAmount: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#6c757d",
//     marginLeft: 10,
//   },
  viewAllButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  viewAllText: {
    color: "#007BFF",
    fontSize: 14,
    fontWeight: "500",
    marginRight: 5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 30,
    marginBottom: 15,
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
    marginTop: 15,
    marginBottom: 5,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
  paymentMethodsContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  addPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addPaymentText: {
    color: "#007BFF",
    fontWeight: "500",
    marginLeft: 10,
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentMethodDetails: {
    flex: 1,
    marginLeft: 15,
  },
  paymentMethodTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  paymentMethodDescription: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  paymentMethodDefault: {
    fontSize: 12,
    color: "#28a745",
    fontWeight: "500",
  },
  disclaimerContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#eaeaea",
  },
  disclaimerText: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  }
}); 