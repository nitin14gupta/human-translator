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