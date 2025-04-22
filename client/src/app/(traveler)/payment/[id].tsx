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
import { getBookingById, createBooking, apiFetch, Booking, CreateBookingData } from '@/src/services/api';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

interface Language {
  language_code: string;
  language_name: string;
  proficiency_level: string;
}

interface TranslatorProfile {
  id: string;
  name: string;
  photo_url: string;
  languages: Language[];
  hourly_rate: number;
  location: string;
  bio: string;
  is_available: boolean;
  rating: number;
  booking_count: number;
}

// Our internal booking data model for the payment screen
interface BookingData {
  id: number;
  translator_id: number;
  date: string;
  start_time: string;
  duration_hours: number;
  location: string;
  total_amount: number;
  notes: string;
  status?: string;
  formatted_date?: string;
  formatted_time?: string;
}

export default function PaymentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [translator, setTranslator] = useState<TranslatorProfile | null>(null);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentSecret, setPaymentSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);

  const paymentMethods: PaymentMethod[] = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'card-outline' },
    { id: 'paypal', name: 'PayPal', icon: 'logo-paypal' },
    { id: 'bank', name: 'Bank Transfer', icon: 'business-outline' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch translator details
        const translatorResponse = await apiFetch<TranslatorProfile>(`/api/translators/${id}`);
        setTranslator(translatorResponse);

        // Create initial booking data
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const newBookingData: CreateBookingData = {
          translator_id: parseInt(id as string), // Convert string ID to number
          date: tomorrow.toISOString().split('T')[0],
          start_time: '10:00',
          duration_hours: 2,
          location: translatorResponse.location || 'To be determined',
          total_amount: translatorResponse.hourly_rate * 2, // 2 hours default duration
          notes: ''
        };
        
        // Create booking
        const bookingResponse = await createBooking(newBookingData);
        
        // Convert API booking format to our internal BookingData format
        const bookingData: BookingData = {
          id: parseInt(bookingResponse.id),
          translator_id: parseInt(id as string),
          date: bookingResponse.date,
          start_time: bookingResponse.time || '10:00',
          duration_hours: bookingResponse.duration_hours,
          location: bookingResponse.location,
          total_amount: bookingResponse.amount,
          notes: bookingResponse.notes || '',
          status: bookingResponse.status,
          formatted_date: bookingResponse.formatted_date,
          formatted_time: bookingResponse.formatted_time
        };
        
        setBooking(bookingData);
        setLoading(false);
      } catch (err: any) {
        console.error('Error handling booking:', err);
        setError(err.message || 'Failed to load or create booking');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSelectPaymentMethod = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  // Function to verify payment status
  const verifyPayment = async (paymentIntentId: string) => {
    try {
      const verifyResponse = await apiFetch('/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          payment_intent_id: paymentIntentId
        })
      });
      
      // If verification succeeds, navigate to success page
      router.push(`/payment/success?booking_id=${booking?.id}`);
    } catch (err: any) {
      console.error('Payment verification error:', err);
      Alert.alert(
        'Payment Verification Failed',
        err.message || 'There was a problem verifying your payment. Please try again.'
      );
      setProcessing(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Payment Method Required', 'Please select a payment method to continue.');
      return;
    }

    if (!booking || !translator) {
      Alert.alert('Error', 'Booking information is missing.');
      return;
    }

    try {
      setProcessing(true);
      
      // Call the payment initiation API
      const response = await apiFetch<{
        payment_id: string;
        amount: number;
        currency: string;
        client_secret: string;
        publishable_key: string;
      }>('/api/payments/initiate', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: booking.id,
          payment_method: selectedMethod
        })
      });
      
      // Store the client secret and publishable key
      setPaymentSecret(response.client_secret);
      setPublishableKey(response.publishable_key);
      
      // For sandbox testing, we'll just assume payment success
      // In a real implementation, you would use Stripe Elements to collect card details
      // and confirm the payment using the client_secret
      
      // For now, simulate a successful payment
      setTimeout(() => {
        // Verify payment status
        verifyPayment(response.client_secret.split('_secret_')[0]);
      }, 2000);
      
    } catch (err: any) {
      console.error('Payment error:', err);
      setProcessing(false);
      Alert.alert(
        'Payment Failed',
        err.message || 'There was a problem processing your payment. Please try again.'
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0056b3" />
        <Text style={styles.loadingText}>
          Loading booking details...
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
        <TouchableOpacity style={styles.retryButton} onPress={() => {}}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate total amount safely
  const calculateTotal = () => {
    if (!translator || !booking) return '0.00';
    return (translator.hourly_rate * booking.duration_hours).toFixed(2);
  };

  const totalAmount = calculateTotal();

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
            <Text style={styles.infoValue}>{translator?.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#555" />
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{booking?.formatted_date || booking?.date}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#555" />
            <Text style={styles.infoLabel}>Duration:</Text>
            <Text style={styles.infoValue}>{`${booking?.duration_hours} hours`}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#555" />
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{booking?.location}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>€{totalAmount}</Text>
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
            <Text style={styles.payButtonText}>Pay €{totalAmount}</Text>
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
        
        {/* Test Card Notice (only in development) */}
        <View style={styles.testCardNotice}>
          <Text style={styles.testCardTitle}>Sandbox Testing</Text>
          <Text style={styles.testCardText}>
            Use these test cards:
          </Text>
          <Text style={styles.testCardText}>
            • Success: 4242 4242 4242 4242
          </Text>
          <Text style={styles.testCardText}>
            • Auth Required: 4000 0025 0000 3155
          </Text>
          <Text style={styles.testCardText}>
            • Decline: 4000 0000 0000 9995
          </Text>
        </View>
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
  testCardNotice: {
    marginTop: 20,
    marginBottom: 40,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1f0ff',
  },
  testCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0056b3',
    marginBottom: 8,
  },
  testCardText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
});
