import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// In React Native, 'localhost' refers to the device itself, not your computer
// For Android emulator, use 10.0.2.2 to reach your computer's localhost
// For iOS simulator, localhost works
// For physical devices, use your computer's actual IP address on the network
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    // Android emulator special IP for host machine
    return 'http://10.0.2.2:8000';
  } else if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    return 'http://localhost:8000';
  } else {
    // For web or other platforms
    return 'http://localhost:8000';
  }
};

const API_URL = getApiBaseUrl();

// Network state information
let isOffline = false;
let isServerMaintenance = false;

// Helper to get stored token
export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('authToken');
};

// Helper function to handle responses
const handleResponse = async (response: Response) => {
  // Check for maintenance mode
  if (response.status === 503) {
    isServerMaintenance = true;
    throw new Error('Server is under maintenance');
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      data
    });
    throw new Error(data.error || data.detail || 'An error occurred');
  }
  
  return data;
};

// Create authenticated headers
export const createAuthHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('No auth token found');
    }

    return {
      'Authorization': `Bearer ${token.trim()}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  } catch (error) {
    console.error('Error creating auth headers:', error);
    throw error;
  }
};

// Wrapper for fetch with error handling
export const apiFetch = async <T = any>(endpoint: string, options?: RequestInit): Promise<T> => {
  try {
    if (isOffline) {
      throw new Error('No internet connection');
    }
    
    if (isServerMaintenance) {
      throw new Error('Server is under maintenance');
    }

    // Only get auth headers for protected endpoints
    const isPublicEndpoint = endpoint.includes('/login') || 
                            endpoint.includes('/register') || 
                            endpoint.includes('/reset-password');
    
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // For protected endpoints, try to add auth header
    if (!isPublicEndpoint) {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required - please log in');
      }
      headers['Authorization'] = `Bearer ${token.trim()}`;
    }

    // Add any custom headers from options
    if (options?.headers) {
      headers = { ...headers, ...(options.headers as Record<string, string>) };
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    // For debugging
    console.log('Request details:', {
      endpoint,
      method: options?.method || 'GET',
      headers,
      body: options?.body
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log('Error response:', errorData);
      
      if (response.status === 401) {
        // Clear auth data on 401 errors
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userId');
        throw new Error('Authentication failed - please log in again');
      }
      if (response.status === 422) {
        throw new Error(errorData.msg || 'Validation error');
      }
      if (response.status === 403) {
        throw new Error('Access denied');
      }
      if (response.status === 404) {
        throw new Error('Resource not found');
      }
      
      throw new Error(errorData.error || errorData.msg || 'An error occurred');
    }
    
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// User related
export const getUserProfile = async () => {
  try {
    const headers = await createAuthHeaders();
    return await apiFetch('/api/users/me', {
      method: 'GET',
      headers,
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile data
export const updateUserProfile = async (data: { preferred_language?: string; is_traveler?: boolean }) => {
  try {
    const headers = await createAuthHeaders();
    return await apiFetch('/api/users/me', {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Update user language preference
export const updateUserLanguage = async (language: string) => {
  return updateUserProfile({ preferred_language: language });
};

// Get user language preference
export const getUserLanguage = async () => {
  try {
    const headers = await createAuthHeaders();
    return await apiFetch('/api/users/me/language', {
      method: 'GET',
      headers,
    });
  } catch (error) {
    console.error('Error getting user language:', error);
    throw error;
  }
};

// Profile management
export const getProfileDetails = async () => {
  try {
    const headers = await createAuthHeaders();
    return await apiFetch('/api/profiles/me', {
      method: 'GET',
      headers,
    });
  } catch (error) {
    console.error('Error getting profile details:', error);
    throw error;
  }
};

export const createUserProfile = async (profileData: any) => {
  try {
    const headers = await createAuthHeaders();
    console.log('Creating profile with data:', profileData);
    
    // Get user type from AsyncStorage instead of API call
    const isTraveler = await AsyncStorage.getItem('isNeedTranslator');
    const endpoint = isTraveler === 'true' ? '/api/profiles/traveler' : '/api/profiles/translator';
    
    // Ensure proper data structure
    const requestData = {
      full_name: profileData.full_name,
      phone_number: profileData.phone_number,
      ...(isTraveler === 'true' 
        ? { 
            nationality: profileData.nationality,
            languages_needed: profileData.languages_needed || profileData.languages  // Handle both field names
          }
        : {
            hourly_rate: Number(profileData.hourly_rate),
            languages: profileData.languages
          }
      )
    };

    console.log('Sending request with data:', requestData);
    
    const result = await apiFetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData)
    });
    
    console.log('Profile creation result:', result);
    await AsyncStorage.removeItem('needsProfileSetup');
    return result;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfileDetails = async (profileData: any) => {
  try {
    const headers = await createAuthHeaders();
    return await apiFetch('/api/profiles/me', {
      method: 'PUT',
      headers,
      body: JSON.stringify(profileData),
    });
  } catch (error) {
    console.error('Error updating profile details:', error);
    throw error;
  }
};

// Set offline status for testing or when NetInfo detects offline
export const setOfflineStatus = (status: boolean) => {
  isOffline = status;
};

// Set maintenance status for testing
export const setMaintenanceStatus = (status: boolean) => {
  isServerMaintenance = status;
};

// Booking related functions
export interface Booking {
  id: string;
  date: string;
  formatted_date: string;
  time: string;
  formatted_time: string;
  duration_hours: number;
  location: string;
  notes?: string;
  status: string;
  amount: number;
  other_user_id: string;
  other_user_name: string;
  other_user_photo?: string;
  created_at: string;
  updated_at: string;
}

export const getBookings = async (status?: string): Promise<Booking[]> => {
  try {
    const headers = await createAuthHeaders();
    const queryParams = status ? `?status=${status}` : '';
    return await apiFetch(`/api/bookings${queryParams}`, {
      method: 'GET',
      headers,
    });
  } catch (error) {
    console.error('Error getting bookings:', error);
    throw error;
  }
};

export const getBookingById = async (bookingId: string): Promise<Booking> => {
  try {
    const headers = await createAuthHeaders();
    return await apiFetch(`/api/bookings/${bookingId}`, {
      method: 'GET',
      headers,
    });
  } catch (error) {
    console.error('Error getting booking details:', error);
    throw error;
  }
};

export interface CreateBookingData {
  translator_id: number;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  duration_hours: number;
  location: string;
  total_amount: number;
  notes?: string;
}

export const createBooking = async (bookingData: CreateBookingData): Promise<Booking> => {
  try {
    const headers = await createAuthHeaders();
    return await apiFetch('/api/bookings', {
      method: 'POST',
      headers,
      body: JSON.stringify(bookingData),
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export interface UpdateBookingData {
  action: 'cancel' | 'complete' | 'reschedule';
  date?: string;
  start_time?: string;
  duration_hours?: number;
  location?: string;
  notes?: string;
}

export const updateBooking = async (bookingId: string, updateData: UpdateBookingData): Promise<Booking> => {
  try {
    const headers = await createAuthHeaders();
    return await apiFetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData),
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
};

export interface ChatMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  sender_name: string;
  sender_is_traveler: boolean;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  name: string;
  photo_url: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  booking_id: string | null;
  is_online: boolean;
}

export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await apiFetch<{ conversations: Conversation[] }>('/api/chat/conversations');
    return response.conversations;
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};

export const getMessages = async (conversationId: string, page: number = 1, perPage: number = 20): Promise<{ 
  messages: ChatMessage[],
  total: number,
  page: number,
  pages: number
}> => {
  try {
    const response = await apiFetch<{ 
      messages: ChatMessage[],
      total: number,
      page: number,
      per_page: number,
      pages: number
    }>(`/api/chat/conversations/${conversationId}/messages?page=${page}&per_page=${perPage}`);
    
    return {
      messages: response.messages,
      total: response.total,
      page: response.page,
      pages: response.pages
    };
  } catch (error) {
    console.error('Error getting messages:', error);
    return {
      messages: [],
      total: 0,
      page: 1,
      pages: 0
    };
  }
};

export const sendMessage = async (conversationId: string, content: string): Promise<ChatMessage | null> => {
  try {
    const response = await apiFetch<{ message: ChatMessage }>(`/api/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });
    
    return response.message;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

export const markConversationAsRead = async (conversationId: string): Promise<boolean> => {
  try {
    await apiFetch(`/api/chat/conversations/${conversationId}/read`, {
      method: 'POST'
    });
    return true;
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    return false;
  }
};

export interface PaymentInitiateRequest {
  booking_id: string;
  payment_method: string;
}

export interface PaymentInitiateResponse {
  payment_id: string;
  checkout_url?: string;
  amount: number;
  currency: string;
}

export interface PaymentVerifyRequest {
  payment_id: string;
  transaction_id: string;
}

export interface PaymentVerifyResponse {
  status: 'success' | 'failed';
  booking_id: string;
  payment_id: string;
  amount: number;
}

export const initiatePayment = async (data: PaymentInitiateRequest): Promise<PaymentInitiateResponse> => {
  try {
    const headers = await createAuthHeaders();
    return await apiFetch('/api/payments/initiate', {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    throw error;
  }
};

export const verifyPayment = async (data: PaymentVerifyRequest): Promise<PaymentVerifyResponse> => {
  try {
    const headers = await createAuthHeaders();
    return await apiFetch('/api/payments/verify', {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

export const getPaymentHistory = async (): Promise<any[]> => {
  try {
    const headers = await createAuthHeaders();
    return await apiFetch('/api/payments/history', {
      method: 'GET',
      headers
    });
  } catch (error) {
    console.error('Error getting payment history:', error);
    return [];
  }
}; 