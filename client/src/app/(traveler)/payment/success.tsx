import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '@/src/services/api';
import { LinearGradient } from 'expo-linear-gradient';

export default function PaymentSuccessScreen() {
  const { booking_id } = useLocalSearchParams<{ booking_id: string }>();
  const router = useRouter();
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        if (booking_id) {
          const response = await apiFetch(`/api/bookings/${booking_id}`);
          setBookingDetails(response);
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [booking_id]);

  const handleViewBooking = () => {
    router.push(`/bookings/${booking_id}`);
  };

  const handleBackToHome = () => {
    router.push('/home');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={['#1a73e8', '#0d47a1']}
        style={styles.header}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#ffffff" />
        </View>
      </LinearGradient>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Payment Successful!</Text>
        
        <View style={styles.card}>
          <Text style={styles.subtitle}>Your booking is confirmed</Text>
          
          {bookingDetails && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Booking ID:</Text>
                <Text style={styles.value}>#{booking_id}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.label}>Translator:</Text>
                <Text style={styles.value}>{bookingDetails.translator?.name || 'Your Translator'}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{bookingDetails.formatted_date || bookingDetails.date}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.label}>Time:</Text>
                <Text style={styles.value}>{bookingDetails.formatted_time || `${bookingDetails.start_time} (${bookingDetails.duration_hours} hrs)`}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.label}>Location:</Text>
                <Text style={styles.value}>{bookingDetails.location}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.detailRow}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>€{bookingDetails.total_amount?.toFixed(2)}</Text>
              </View>
            </>
          )}
          
          {loading && (
            <Text style={styles.loadingText}>Loading booking details...</Text>
          )}
        </View>
        
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color="#1a73e8" />
          <Text style={styles.infoText}>
            A confirmation has been sent to your email. You can also view your booking details in the app.
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleViewBooking}
        >
          <Text style={styles.primaryButtonText}>View Booking</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleBackToHome}
        >
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    marginTop: -40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#1a73e8',
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
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a73e8',
  },
  secondaryButtonText: {
    color: '#1a73e8',
    fontSize: 16,
    fontWeight: '500',
  },
}); 