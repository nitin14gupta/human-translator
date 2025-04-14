import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBookingById } from '@/src/services/api';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { booking_id } = useLocalSearchParams<{ booking_id: string }>();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookingDetails = async () => {
      try {
        setLoading(true);
        
        if (!booking_id) {
          throw new Error('Booking ID is required');
        }
        
        const bookingData = await getBookingById(booking_id);
        setBooking(bookingData);
      } catch (err: any) {
        console.error('Error loading booking:', err);
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    loadBookingDetails();
  }, [booking_id]);

  const handleViewBooking = () => {
    // Navigate to the booking details screen
    router.push(`/booking/${booking_id}`);
  };

  const handleGoHome = () => {
    // Navigate back to the home screen
    router.push('/(tabs)/traveler');
  };

  const handleContactTranslator = () => {
    // Navigate to chat with the translator
    if (booking && booking.other_user_id) {
      router.push(`/chat/${booking.other_user_id}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0056b3" />
        <Text style={styles.loadingText}>Confirming payment...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#e53e3e" />
        <Text style={styles.errorTitle}>Error Confirming Payment</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleGoHome}
        >
          <Text style={styles.primaryButtonText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Payment Successful' }} />
      <View style={styles.container}>
        <Animated.View 
          entering={FadeIn.delay(300).duration(1000)}
          style={styles.successIconContainer}
        >
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark" size={80} color="#fff" />
          </View>
        </Animated.View>
        
        <Animated.Text 
          entering={FadeInDown.delay(600).duration(800)}
          style={styles.successTitle}
        >
          Payment Successful!
        </Animated.Text>
        
        <Animated.Text 
          entering={FadeInDown.delay(900).duration(800)}
          style={styles.successMessage}
        >
          Your booking has been confirmed. The translator has been notified and will contact you soon.
        </Animated.Text>
        
        {booking && (
          <Animated.View 
            entering={FadeInDown.delay(1200).duration(800)}
            style={styles.bookingSummary}
          >
            <Text style={styles.summaryTitle}>Booking Details</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Translator:</Text>
              <Text style={styles.summaryValue}>{booking.other_user_name}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date:</Text>
              <Text style={styles.summaryValue}>{booking.formatted_date}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time:</Text>
              <Text style={styles.summaryValue}>{booking.formatted_time}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount Paid:</Text>
              <Text style={styles.summaryValue}>€{booking.amount.toFixed(2)}</Text>
            </View>
          </Animated.View>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleViewBooking}
          >
            <Text style={styles.primaryButtonText}>View Booking</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleContactTranslator}
          >
            <Text style={styles.secondaryButtonText}>Contact Translator</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={handleGoHome}
          >
            <Text style={styles.tertiaryButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
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
  successIconContainer: {
    marginTop: 40,
    marginBottom: 24,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  bookingSummary: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#555',
    width: 100,
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#0056b3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0056b3',
  },
  secondaryButtonText: {
    color: '#0056b3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tertiaryButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  tertiaryButtonText: {
    color: '#0056b3',
    fontSize: 16,
  },
}); 