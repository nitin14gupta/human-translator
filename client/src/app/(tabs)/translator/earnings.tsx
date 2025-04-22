import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import { StatusBar } from "expo-status-bar";
import { getEarningsSummary, getEarningsTransactions, withdrawEarnings, Transaction, EarningsSummary } from "../../../services/api";

export default function EarningsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "payouts">("overview");
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalInProgress, setWithdrawalInProgress] = useState(false);

  // State for holding API data
  const [summary, setSummary] = useState<EarningsSummary>({
    today_earnings: 0,
    total_earnings: 0,
    pending_earnings: 0,
    available_balance: 0,
    total_payouts: 0,
    weekly_earnings: [0, 0, 0, 0, 0, 0, 0],
    weekly_labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch earnings data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load all data (summary and transactions)
  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch summary
      const summaryData = await getEarningsSummary();
      setSummary(summaryData);

      // Fetch all transactions
      const transactionsData = await getEarningsTransactions();
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading earnings data:', error);
      Alert.alert('Error', 'Failed to load earnings data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch transactions only for a specific type
  const loadTransactions = async (type: 'earnings' | 'payouts' | 'all') => {
    try {
      const data = await getEarningsTransactions(type);
      setTransactions(data);
    } catch (error) {
      console.error(`Error loading ${type} transactions:`, error);
      Alert.alert('Error', `Failed to load ${type}. Please try again.`);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  // Handle tab change
  const handleTabChange = async (tab: "overview" | "transactions" | "payouts") => {
    setActiveTab(tab);

    // Load appropriate transactions for the selected tab
    if (tab === "transactions") {
      await loadTransactions('earnings');
    } else if (tab === "payouts") {
      await loadTransactions('payouts');
    }
  };

  // Handle withdraw button press
  const handleWithdraw = () => {
    setWithdrawalAmount('');
    setShowWithdrawalModal(true);
  };

  // Process withdrawal
  const processWithdrawal = async () => {
    // Validate amount
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than zero.');
      return;
    }

    if (amount > summary.available_balance) {
      Alert.alert('Insufficient Balance', 'The withdrawal amount exceeds your available balance.');
      return;
    }

    setWithdrawalInProgress(true);
    try {
      // Process withdrawal
      const response = await withdrawEarnings({
        amount,
        payment_method: 'bank_transfer' // Default payment method
      });

      // Hide modal and reload data
      setShowWithdrawalModal(false);

      // Show success message
      Alert.alert(
        'Withdrawal Successful',
        `€${amount} has been sent to your bank account. It may take 1-3 business days to appear in your account.`,
        [
          { text: 'OK', onPress: loadData }
        ]
      );
    } catch (error: any) {
      Alert.alert('Withdrawal Failed', error.message || 'An error occurred processing your withdrawal');
    } finally {
      setWithdrawalInProgress(false);
    }
  };

  // Format weekly data for chart
  const chartData = {
    labels: summary.weekly_labels,
    datasets: [{
      data: summary.weekly_earnings,
    }],
  };

  // Filter transactions based on active tab
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

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text className="text-gray-600 mt-4">Loading earnings data...</Text>
      </View>
    );
  }

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
          €{summary.available_balance.toFixed(2)}
        </Text>
        <TouchableOpacity
          className="bg-blue-600 px-4 py-2 rounded-full mt-4 self-start"
          onPress={handleWithdraw}
          disabled={summary.available_balance <= 0}
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
            <Text className="text-2xl font-bold text-gray-900">€{summary.total_earnings.toFixed(2)}</Text>
          </View>

          <View className="flex-1 bg-white rounded-2xl p-4 ml-2 shadow-sm">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-yellow-100 items-center justify-center">
                <Ionicons name="time" size={18} color="#b45309" />
              </View>
              <Text className="text-gray-600 ml-2">Pending</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">€{summary.pending_earnings.toFixed(2)}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-white border-b border-gray-200 mx-4 rounded-t-2xl">
          {(["overview", "transactions", "payouts"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-4 ${activeTab === tab
                ? "border-b-2 border-blue-600"
                : ""
                }`}
              onPress={() => handleTabChange(tab)}
            >
              <Text
                className={`text-center font-medium ${activeTab === tab
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
                    <Text className={`text-lg font-bold ${transaction.type === "payout" ? "text-red-600" : "text-green-600"
                      }`}>
                      {transaction.type === "payout" ? "-" : "+"}€{transaction.amount.toFixed(2)}
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

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center p-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-gray-900 mb-4">Withdraw Funds</Text>

            <Text className="text-gray-600 mb-2">Available Balance: €{summary.available_balance.toFixed(2)}</Text>

            <View className="border border-gray-200 rounded-lg mb-4">
              <TextInput
                value={withdrawalAmount}
                onChangeText={setWithdrawalAmount}
                placeholder="Enter amount"
                keyboardType="decimal-pad"
                className="p-3 text-gray-900"
              />
            </View>

            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 bg-gray-100 py-3 rounded-lg mr-2"
                onPress={() => setShowWithdrawalModal(false)}
                disabled={withdrawalInProgress}
              >
                <Text className="text-gray-700 text-center font-medium">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-blue-600 py-3 rounded-lg ml-2"
                onPress={processWithdrawal}
                disabled={!withdrawalAmount || withdrawalInProgress}
              >
                {withdrawalInProgress ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-center font-medium">Withdraw</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
