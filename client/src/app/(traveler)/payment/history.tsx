import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getPaymentHistory } from '@/src/services/api';

interface Payment {
  payment_id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  created_at: string;
}

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      const data = await getPaymentHistory();
      setPayments(data);
    } catch (err: any) {
      console.error('Error loading payments:', err);
      setError(err.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const onRefresh = () => loadPayments(true);

  const handleViewBooking = (bookingId: string) => {
    router.push(`/booking/${bookingId}`);
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => {
    const date = new Date(item.created_at);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity
        style={styles.paymentCard}
        onPress={() => handleViewBooking(item.booking_id)}
      >
        <View style={styles.paymentHeader}>
          <View style={styles.paymentMethod}>
            {item.payment_method === 'card' ? (
              <Ionicons name="card-outline" size={24} color="#0056b3" />
            ) : item.payment_method === 'paypal' ? (
              <Ionicons name="logo-paypal" size={24} color="#0056b3" />
            ) : (
              <Ionicons name="business-outline" size={24} color="#0056b3" />
            )}
            <Text style={styles.paymentMethodText}>
              {item.payment_method === 'card'
                ? 'Credit/Debit Card'
                : item.payment_method === 'paypal'
                ? 'PayPal'
                : 'Bank Transfer'}
            </Text>
          </View>
          <Text style={styles.paymentAmount}>
            {item.currency === 'EUR' ? '€' : '$'}{item.amount.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentInfoLabel}>Status:</Text>
          <View style={[
            styles.statusBadge,
            item.status === 'completed' ? styles.statusCompleted : 
            item.status === 'pending' ? styles.statusPending :
            styles.statusFailed
          ]}>
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentInfoLabel}>Booking ID:</Text>
          <Text style={styles.paymentInfoValue}>#{item.booking_id}</Text>
        </View>
        
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentInfoLabel}>Date:</Text>
          <Text style={styles.paymentInfoValue}>{formattedDate} at {formattedTime}</Text>
        </View>
        
        <View style={styles.paymentFooter}>
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => handleViewBooking(item.booking_id)}
          >
            <Text style={styles.viewButtonText}>View Booking</Text>
            <Ionicons name="chevron-forward" size={16} color="#0056b3" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0056b3" />
        <Text style={styles.loadingText}>Loading payment history...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Payment History' }} />
      
      <View style={styles.container}>
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#e53e3e" />
            <Text style={styles.errorTitle}>Error Loading Payments</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadPayments()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={payments}
              renderItem={renderPaymentItem}
              keyExtractor={item => item.payment_id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="receipt-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyTitle}>No Payments Found</Text>
                  <Text style={styles.emptyText}>
                    You haven't made any payments yet.
                  </Text>
                </View>
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#e53e3e',
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0056b3',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0056b3',
  },
  paymentInfo: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  paymentInfoLabel: {
    width: 100,
    fontSize: 14,
    color: '#777',
  },
  paymentInfoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: '#d1fae5',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
  },
  statusFailed: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  paymentFooter: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#0056b3',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
}); 