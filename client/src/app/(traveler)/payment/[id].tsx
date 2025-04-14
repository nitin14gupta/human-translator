import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBookingById, createBooking, apiFetch } from '@/src/services/api';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

export default function PaymentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creatingBooking, setCreatingBooking] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'card-outline' },
    { id: 'paypal', name: 'PayPal', icon: 'logo-paypal' },
    { id: 'bank', name: 'Bank Transfer', icon: 'business-outline' },
  ];

  useEffect(() => {
    loadBookingOrCreate();
  }, [id]);

  const loadBookingOrCreate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!id) {
        throw new Error('Translator ID is required');
      }
      
      try {
        // First try to get the booking if it exists
        const bookingData = await getBookingById(id);
        setBooking(bookingData);
      } catch (err: any) {
        console.log("Booking not found, creating new booking...");
        
        // If booking doesn't exist, create a new one
        setCreatingBooking(true);
        
        // Create a new booking with the translator ID from the URL
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const translatorId = parseInt(id);
        
        const newBookingData = {
          translator_id: translatorId,
          date: tomorrow.toISOString().split('T')[0], // Tomorrow's date
          start_time: '10:00', // 10 AM
          duration_hours: 2,
          location: 'City Center',
          total_amount: 120, // Default amount
          notes: 'Booking created for payment testing'
        };
        
        const newBooking = await createBooking(newBookingData);
        setBooking(newBooking);
        setCreatingBooking(false);
        
        // Show success message
        Alert.alert(
          'Booking Created',
          'A test booking has been created. You can now proceed with payment.',
          [{ text: 'OK' }]
        );
      }
    } catch (err: any) {
      console.error('Error handling booking:', err);
      setError(err.message || 'Failed to load or create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPaymentMethod = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleProcessPayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Payment Method Required', 'Please select a payment method to continue.');
      return;
    }

    if (!booking) {
      Alert.alert('Error', 'No booking available for payment.');
      return;
    }

    try {
      setProcessing(true);
      
      // Call the payment initiation API
      const response = await apiFetch('/api/payments/initiate', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: booking.id,
          payment_method: selectedMethod
        })
      });
      
      // Navigate to success page after payment
      router.push(`/payment/success?booking_id=${booking.id}`);
    } catch (err: any) {
      console.error('Payment error:', err);
      Alert.alert(
        'Payment Failed',
        err.message || 'There was a problem processing your payment. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading || creatingBooking) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0056b3" />
        <Text style={styles.loadingText}>
          {creatingBooking ? 'Creating booking...' : 'Loading booking details...'}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#e53e3e" />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadBookingOrCreate}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Complete Payment' }} />
      <ScrollView style={styles.container}>
        {/* Booking Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Booking Summary</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#555" />
            <Text style={styles.infoLabel}>Translator:</Text>
            <Text style={styles.infoValue}>{booking?.other_user_name || `Translator #${id}`}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#555" />
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{booking?.formatted_date || booking?.date}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#555" />
            <Text style={styles.infoLabel}>Time:</Text>
            <Text style={styles.infoValue}>{booking?.formatted_time || `${booking?.start_time} (${booking?.duration_hours} hours)`}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#555" />
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{booking?.location}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>€{booking?.amount ? booking.amount.toFixed(2) : booking?.total_amount.toFixed(2)}</Text>
          </View>
        </View>
        
        {/* Payment Methods */}
        <View style={styles.paymentMethodsCard}>
          <Text style={styles.cardTitle}>Select Payment Method</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodButton,
                selectedMethod === method.id && styles.selectedPaymentMethod
              ]}
              onPress={() => handleSelectPaymentMethod(method.id)}
              disabled={processing}
            >
              <Ionicons 
                name={method.icon as any} 
                size={24} 
                color={selectedMethod === method.id ? "#fff" : "#0056b3"} 
              />
              <Text 
                style={[
                  styles.paymentMethodText,
                  selectedMethod === method.id && styles.selectedPaymentMethodText
                ]}
              >
                {method.name}
              </Text>
              {selectedMethod === method.id && (
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Secure Transaction Notice */}
        <View style={styles.secureNotice}>
          <Ionicons name="lock-closed" size={16} color="#555" />
          <Text style={styles.secureText}>
            All transactions are secure and encrypted
          </Text>
        </View>
        
        {/* Pay Button */}
        <TouchableOpacity
          style={[styles.payButton, (!selectedMethod || processing) && styles.disabledButton]}
          onPress={handleProcessPayment}
          disabled={!selectedMethod || processing}
        >
          {processing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay €{booking?.amount?.toFixed(2) || booking?.total_amount.toFixed(2) || '0.00'}
            </Text>
          )}
        </TouchableOpacity>
        
        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={processing}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#e53e3e',
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
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
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#555',
    marginLeft: 8,
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0056b3',
  },
  paymentMethodsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedPaymentMethod: {
    borderColor: '#0056b3',
    backgroundColor: '#0056b3',
  },
  paymentMethodText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
    flex: 1,
  },
  selectedPaymentMethodText: {
    color: '#fff',
  },
  secureNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  secureText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#555',
  },
  payButton: {
    backgroundColor: '#0056b3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: '#b3c1d1',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 36,
  },
  cancelButtonText: {
    color: '#0056b3',
    fontSize: 16,
  },
});
