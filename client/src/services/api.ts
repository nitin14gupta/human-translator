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

// Helper function to handle responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
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

// Authentication
export const sendVerificationCode = async (phoneNumber: string) => {
  const response = await fetch(`${API_URL}/send-verification-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone_number: phoneNumber,
    }),
  });
  
  return handleResponse(response);
};

export const verifyCode = async (phoneNumber: string, code: string, isNeedTranslator: boolean, language: string = 'en') => {
  const response = await fetch(`${API_URL}/verify-code`, {
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
  
  const data = await handleResponse(response);
  
  // Save token
  if (data.access_token) {
    await AsyncStorage.setItem('authToken', data.access_token);
    await AsyncStorage.setItem('userId', data.user_id.toString());
    await AsyncStorage.setItem('isNeedTranslator', data.is_traveler.toString());
  }
  
  return data;
};

// User related
export const getUserProfile = async () => {
  const headers = await createAuthHeaders();
  
  const response = await fetch(`${API_URL}/users/me`, {
    method: 'GET',
    headers,
  });
  
  return handleResponse(response);
};

// Update user profile data
export const updateUserProfile = async (data: { preferred_language?: string; is_traveler?: boolean }) => {
  const headers = await createAuthHeaders();
  
  const response = await fetch(`${API_URL}/users/me`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  
  return handleResponse(response);
};

// Language preferences
export const updateUserLanguage = async (language: string) => {
  return updateUserProfile({ preferred_language: language });
};

export const getUserLanguage = async () => {
  const headers = await createAuthHeaders();
  
  const response = await fetch(`${API_URL}/users/me/language`, {
    method: 'GET',
    headers,
  });
  
  return handleResponse(response);
}; 