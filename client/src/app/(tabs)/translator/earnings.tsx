import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import { StatusBar } from "expo-status-bar";

interface Transaction {
  id: string;
  travelerName: string;
  date: string;
  amount: number;
  status: "completed" | "pending";
  type: "earning" | "payout";
}

export default function EarningsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "payouts">("overview");

  // Mock data for earnings chart
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      data: [65, 85, 110, 75, 95, 120, 80],
    }],
  };

  // Mock data for transactions
  const transactions: Transaction[] = [
    {
      id: "1",
      travelerName: "John Smith",
      date: "Today, 14:00",
      amount: 120,
      status: "completed",
      type: "earning",
    },
    {
      id: "2",
      travelerName: "Maria Garcia",
      date: "Yesterday, 10:00",
      amount: 90,
      status: "completed",
      type: "earning",
    },
    {
      id: "3",
      travelerName: "Bank Transfer",
      date: "Jun 20, 2024",
      amount: 450,
      status: "completed",
      type: "payout",
    },
    {
      id: "4",
      travelerName: "David Chen",
      date: "Jun 19, 2024",
      amount: 100,
      status: "pending",
      type: "earning",
    },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1500);
  };

  const filteredTransactions = transactions.filter(transaction => {
    switch (activeTab) {
      case "transactions":
        return transaction.type === "earning";
      case "payouts":
        return transaction.type === "payout";
      default:
        return true;
    }
  });

  const totalEarnings = transactions
    .filter(t => t.type === "earning" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingEarnings = transactions
    .filter(t => t.type === "earning" && t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayouts = transactions
    .filter(t => t.type === "payout" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4">
        <Text className="text-2xl font-bold text-gray-900">Earnings</Text>
        <Text className="text-gray-600 mt-1">Track your earnings and payouts</Text>
      </View>

      {/* Balance Card */}
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <Text className="text-gray-600 mb-1">Available Balance</Text>
        <Text className="text-3xl font-bold text-gray-900">
          €{totalEarnings - totalPayouts}
        </Text>
        <TouchableOpacity 
          className="bg-blue-600 px-4 py-2 rounded-full mt-4 self-start"
          onPress={() => Alert.alert("Withdraw", "Withdrawal feature not implemented")}
        >
          <Text className="text-white font-medium">Withdraw Funds</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row px-4 py-4">
          <View className="flex-1 bg-white rounded-2xl p-4 mr-2 shadow-sm">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center">
                <Ionicons name="wallet" size={18} color="#15803d" />
              </View>
              <Text className="text-gray-600 ml-2">Total Earned</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">€{totalEarnings}</Text>
          </View>

          <View className="flex-1 bg-white rounded-2xl p-4 ml-2 shadow-sm">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-yellow-100 items-center justify-center">
                <Ionicons name="time" size={18} color="#b45309" />
              </View>
              <Text className="text-gray-600 ml-2">Pending</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">€{pendingEarnings}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-white border-b border-gray-200 mx-4 rounded-t-2xl">
          {(["overview", "transactions", "payouts"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-4 ${
                activeTab === tab
                  ? "border-b-2 border-blue-600"
                  : ""
              }`}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className={`text-center font-medium ${
                  activeTab === tab
                    ? "text-blue-600"
                    : "text-gray-600"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "overview" && (
          <View className="mx-4">
            {/* Earnings Chart */}
            <View className="bg-white px-4 pt-4 pb-6 rounded-b-2xl shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-4">Weekly Earnings</Text>
              <LineChart
                data={chartData}
                width={Platform.OS === 'web' ? 500 : 320}
                height={220}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(26, 115, 232, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#1a73e8"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
            </View>
          </View>
        )}

        {/* Transactions List */}
        {(activeTab === "transactions" || activeTab === "payouts") && (
          <View className="mx-4">
            {filteredTransactions.map((transaction) => (
              <View
                key={transaction.id}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
              >
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="text-base font-semibold text-gray-900">
                      {transaction.travelerName}
                    </Text>
                    <Text className="text-gray-600 text-sm mt-1">
                      {transaction.date}
                    </Text>
                  </View>
                  <View>
                    <Text className={`text-lg font-bold ${
                      transaction.type === "payout" ? "text-red-600" : "text-green-600"
                    }`}>
                      {transaction.type === "payout" ? "-" : "+"}€{transaction.amount}
                    </Text>
                    {transaction.status === "pending" && (
                      <View className="bg-yellow-100 rounded-full px-2 py-1 mt-1">
                        <Text className="text-yellow-800 text-xs text-center">Pending</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}

            {filteredTransactions.length === 0 && (
              <View className="items-center justify-center py-12">
                <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-4">
                  <Ionicons 
                    name={activeTab === "transactions" ? "wallet-outline" : "card-outline"}
                    size={32}
                    color="#1a73e8"
                  />
                </View>
                <Text className="text-lg font-semibold text-gray-900 mb-2">
                  No {activeTab}
                </Text>
                <Text className="text-gray-600 text-center">
                  {activeTab === "transactions"
                    ? "You don't have any transactions yet."
                    : "You don't have any payouts yet."}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
