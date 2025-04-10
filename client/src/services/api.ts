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

// Helper function to handle responses
const handleResponse = async (response: Response) => {
  // Check for maintenance mode
  if (response.status === 503) {
    isServerMaintenance = true;
    throw new Error('Server is under maintenance');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: `Error: ${response.status} ${response.statusText}`
    }));
    throw new Error(error.detail || 'An error occurred');
  }
  
  return response.json();
};

// Get auth token from storage
const getToken = async () => {
  return await AsyncStorage.getItem('authToken');
};

// Create authenticated headers
const createAuthHeaders = async () => {
  const token = await getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Wrapper for fetch with error handling
export const apiFetch = async (endpoint: string, options?: RequestInit) => {
  try {
    if (isOffline) {
      throw new Error('No internet connection');
    }
    
    if (isServerMaintenance) {
      throw new Error('Server is under maintenance');
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, options);
    return await handleResponse(response);
  } catch (error) {
    // Re-throw the error for the component to handle
    throw error;
  }
};

// Authentication
export const sendVerificationCode = async (phoneNumber: string) => {
  try {
    return await apiFetch('/send-verification-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
      }),
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw error;
  }
};

export const verifyCode = async (phoneNumber: string, code: string, isNeedTranslator: boolean, language: string = 'en') => {
  try {
    const data = await apiFetch('/verify-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        code: code,
        is_traveler: isNeedTranslator,
        preferred_language: language,
      }),
    });
    
    // Save token
    if (data.access_token) {
      await AsyncStorage.setItem('authToken', data.access_token);
      await AsyncStorage.setItem('userId', data.user_id.toString());
      await AsyncStorage.setItem('isNeedTranslator', data.is_traveler.toString());
    }
    
    return data;
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
};

// User related
export const getUserProfile = async () => {
  try {
    const headers = await createAuthHeaders();
    return await apiFetch('/users/me', {
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
    return await apiFetch('/users/me', {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Language preferences
export const updateUserLanguage = async (language: string) => {
  return updateUserProfile({ preferred_language: language });
};

export const getUserLanguage = async () => {
  try {
    const headers = await createAuthHeaders();
    return await apiFetch('/users/me/language', {
      method: 'GET',
      headers,
    });
  } catch (error) {
    console.error('Error getting user language:', error);
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