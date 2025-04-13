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
  RefreshControl,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";

const screenWidth = Dimensions.get("window").width;

interface Transaction {
  id: string;
  travelerName: string;
  type: "session" | "payout";
  amount: number;
  date: string;
  time: string;
  status: "completed" | "processed" | "pending";
  location?: string;
  rating?: number;
  duration?: string;
  payoutMethod?: string;
  reference?: string;
}

interface Payout {
  id: string;
  amount: number;
  date: string;
  method: string;
  status: "processed" | "pending";
  reference: string;
}

interface ChartData {
  earnings: {
    labels: string[];
    data: number[];
  };
  sessions: {
    labels: string[];
    data: number[];
  };
}

interface EarningsData {
  currentBalance: number;
  currency: string;
  weeklyEarnings: number;
  monthlyEarnings: number;
  yearlyEarnings: number;
  pendingPayouts: number;
  nextPayoutDate: string;
  averageRating: number;
  totalSessions: number;
  chartData: ChartData;
}

export default function TranslatorEarningsScreen() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions"); // "transactions" or "payouts"
  const [timeRange, setTimeRange] = useState("week"); // "week", "month", "year", "all"
  const [showChart, setShowChart] = useState("earnings"); // "earnings" or "sessions"

  // Mock data for earnings
  const [earnings, setEarnings] = useState<EarningsData>({
    currentBalance: 450,
    currency: "EUR",
    weeklyEarnings: 180,
    monthlyEarnings: 780,
    yearlyEarnings: 3840,
    pendingPayouts: 450,
    nextPayoutDate: "Friday, June 16",
    averageRating: 4.8,
    totalSessions: 48,
    chartData: {
      earnings: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        data: [65, 85, 110, 75, 95, 120, 80],
      },
      sessions: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        data: [2, 3, 4, 2, 3, 4, 2],
      },
    },
  });

  // Mock data for transactions
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "tx1",
      travelerName: "John Smith",
      type: "session",
      amount: 85,
      date: "2023-06-12",
      time: "11:30 AM - 1:30 PM",
      status: "completed",
      location: "Musée du Louvre",
      rating: 5,
      duration: "2 hours",
    },
    {
      id: "tx2",
      travelerName: "Maria Rodriguez",
      type: "session",
      amount: 60,
      date: "2023-06-10",
      time: "2:00 PM - 3:30 PM",
      status: "completed",
      location: "Champs-Élysées",
      rating: 4.5,
      duration: "1.5 hours",
    },
    {
      id: "tx3",
      travelerName: "Michael Chen",
      type: "session",
      amount: 35,
      date: "2023-06-08",
      time: "10:00 AM - 11:00 AM",
      status: "completed",
      location: "Eiffel Tower",
      rating: 5,
      duration: "1 hour",
    },
    {
      id: "tx4",
      travelerName: "System",
      type: "payout",
      amount: -380,
      date: "2023-06-02",
      time: "",
      status: "processed",
      payoutMethod: "Bank Transfer",
      reference: "PAY-2023060201",
    },
  ]);

  // Mock data for payouts
  const [payouts, setPayouts] = useState<Payout[]>([
    {
      id: "pay1",
      amount: 380,
      date: "2023-06-02",
      method: "Bank Transfer",
      status: "processed",
      reference: "PAY-2023060201",
    },
    {
      id: "pay2",
      amount: 450,
      date: "2023-05-26",
      method: "Bank Transfer",
      status: "processed",
      reference: "PAY-2023052601",
    },
    {
      id: "pay3",
      amount: 520,
      date: "2023-05-19",
      method: "Bank Transfer",
      status: "processed",
      reference: "PAY-2023051901",
    },
  ]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
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

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
    style: {
      borderRadius: 16,
    },
  };

  // Render a transaction item
  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-center">
        <View className={`w-10 h-10 rounded-full justify-center items-center ${
          item.type === "payout" ? "bg-neutral-100" : "bg-blue-50"
        }`}>
          <Ionicons 
            name={item.type === "payout" ? "arrow-down" : "cash-outline"} 
            size={20} 
            color={item.type === "payout" ? "#6c757d" : "#007BFF"} 
          />
        </View>
        
        <View className="flex-1 ml-3">
          <Text className="text-base font-medium text-neutral-800">
            {item.type === "session" 
              ? `Session with ${item.travelerName}` 
              : "Payout to Bank Account"}
          </Text>
          
          <View className="flex-row items-center mt-1">
            <Text className="text-sm text-neutral-600">
              {item.date}{item.time ? `, ${item.time}` : ""}
            </Text>
            <View className="flex-row items-center ml-2">
              <View className={`w-2 h-2 rounded-full ${
                item.status === "completed" || item.status === "processed"
                  ? "bg-green-500"
                  : "bg-yellow-500"
              }`} />
              <Text className="text-xs text-neutral-500 ml-1">
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
          
          {item.location && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={14} color="#6c757d" />
              <Text className="text-sm text-neutral-600 ml-1">{item.location}</Text>
              {item.duration && (
                <>
                  <Text className="text-neutral-400 mx-1">•</Text>
                  <Text className="text-sm text-neutral-600">{item.duration}</Text>
                </>
              )}
            </View>
          )}
          
          {item.rating && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text className="text-sm text-neutral-600 ml-1">{item.rating}</Text>
            </View>
          )}
        </View>
        
        <Text className={`text-lg font-bold ${
          item.type === "payout" ? "text-red-500" : "text-green-500"
        }`}>
          {item.type === "payout" ? "-" : "+"}€{Math.abs(item.amount)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Render a payout item
  const renderPayoutItem = ({ item }: { item: Payout }) => (
    <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-neutral-100 justify-center items-center">
          <Ionicons name="card-outline" size={20} color="#6c757d" />
        </View>
        
        <View className="flex-1 ml-3">
          <Text className="text-base font-medium text-neutral-800">
            Payout via {item.method}
          </Text>
          
          <View className="flex-row items-center mt-1">
            <Text className="text-sm text-neutral-600">{item.date}</Text>
            <View className="flex-row items-center ml-2">
              <View className={`w-2 h-2 rounded-full ${
                item.status === "processed" ? "bg-green-500" : "bg-yellow-500"
              }`} />
              <Text className="text-xs text-neutral-500 ml-1">
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
          
          <Text className="text-xs text-neutral-500 mt-1">
            Ref: {item.reference}
          </Text>
        </View>
        
        <Text className="text-lg font-bold text-neutral-800">
          €{item.amount}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-neutral-gray-100">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="bg-primary pt-12 pb-6 px-4">
        <Text className="text-white text-xl font-bold mb-1">
          {t("earnings.title")}
        </Text>
        <Text className="text-white text-opacity-80">
          {t("earnings.subtitle")}
        </Text>
        
        {/* Current Balance Card */}
        <View className="bg-white rounded-xl mt-4 p-4">
          <Text className="text-sm text-neutral-600">Current Balance</Text>
          <Text className="text-3xl font-bold text-neutral-800 mt-1">
            €{earnings.currentBalance}
          </Text>
          <View className="flex-row items-center mt-2">
            <Text className="text-sm text-neutral-600">
              Next payout on {earnings.nextPayoutDate}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row justify-between px-4 py-4">
          <View className="bg-white rounded-xl p-4 flex-1 mr-2">
            <Text className="text-sm text-neutral-600">This Week</Text>
            <Text className="text-xl font-bold text-neutral-800 mt-1">
              €{earnings.weeklyEarnings}
            </Text>
          </View>
          <View className="bg-white rounded-xl p-4 flex-1 ml-2">
            <Text className="text-sm text-neutral-600">This Month</Text>
            <Text className="text-xl font-bold text-neutral-800 mt-1">
              €{earnings.monthlyEarnings}
            </Text>
          </View>
        </View>

        {/* Chart Section */}
        <View className="bg-white mx-4 rounded-xl p-4 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-neutral-800">
              {showChart === "earnings" ? "Earnings" : "Sessions"} Overview
            </Text>
            <TouchableOpacity
              onPress={() => setShowChart(
                showChart === "earnings" ? "sessions" : "earnings"
              )}
              className="bg-blue-50 px-3 py-1 rounded-full"
            >
              <Text className="text-primary text-sm">
                Show {showChart === "earnings" ? "Sessions" : "Earnings"}
              </Text>
            </TouchableOpacity>
          </View>
          
          <LineChart
            data={{
              labels: earnings.chartData[showChart as keyof ChartData].labels,
              datasets: [{
                data: earnings.chartData[showChart as keyof ChartData].data
              }]
            }}
            width={screenWidth - 48}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </View>

        {/* Tabs */}
        <View className="flex-row bg-white mx-4 rounded-xl mb-4">
          <TouchableOpacity
            className={`flex-1 py-3 ${
              activeTab === "transactions" ? "border-b-2 border-primary" : ""
            }`}
            onPress={() => setActiveTab("transactions")}
          >
            <Text className={`text-center font-medium ${
              activeTab === "transactions" ? "text-primary" : "text-neutral-600"
            }`}>
              Transactions
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 py-3 ${
              activeTab === "payouts" ? "border-b-2 border-primary" : ""
            }`}
            onPress={() => setActiveTab("payouts")}
          >
            <Text className={`text-center font-medium ${
              activeTab === "payouts" ? "text-primary" : "text-neutral-600"
            }`}>
              Payouts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Time Range Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mb-4"
        >
          {["week", "month", "year", "all"].map((range) => (
            <TouchableOpacity
              key={range}
              className={`px-4 py-2 rounded-full mr-2 ${
                timeRange === range
                  ? "bg-primary"
                  : "bg-white"
              }`}
              onPress={() => setTimeRange(range)}
            >
              <Text className={
                timeRange === range
                  ? "text-white font-medium"
                  : "text-neutral-600"
              }>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transactions/Payouts List */}
        <View className="px-4 pb-6">
          {activeTab === "transactions" ? (
            getFilteredTransactions().map((item) => (
              <View key={item.id}>
                {renderTransactionItem({ item })}
              </View>
            ))
          ) : (
            payouts.map((item) => (
              <View key={item.id}>
                {renderPayoutItem({ item })}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
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