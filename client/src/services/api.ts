import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL - adjust as needed for your environment
export const getApiBaseUrl = (): string => {
  // For development, you can switch this based on environment
  return 'http://localhost:5000';
};

// Generic API call function with authentication
export const apiCall = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  data?: any
) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    // Make the actual API call
    console.log(`API call to ${endpoint} with method ${method}`, data);
    
    const response = await fetch(`${getApiBaseUrl()}${endpoint}`, options);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || 'API request failed');
    }
    
    return responseData;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Auth service functions
export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  is_traveler: boolean;
  preferred_language?: string;
}) => {
  return apiCall('/api/auth/register', 'POST', userData);
};

export const loginUser = async (credentials: { email: string; password: string }) => {
  return apiCall('/api/auth/login', 'POST', credentials);
};

export const resetPassword = async (email: string) => {
  return apiCall('/api/auth/reset-password', 'POST', { email });
};

export const confirmResetPassword = async (token: string, password: string, confirm_password: string) => {
  return apiCall(`/api/auth/reset-password/${token}`, 'POST', { password, confirm_password });
};

export const getUserType = async () => {
  return apiCall('/api/auth/user-type', 'GET');
};

// User profile functions
export const createUserProfile = async (profileData: any) => {
  return apiCall('/api/profiles/traveler', 'POST', profileData);
};

export const updateUserProfileDetails = async (userId: string, profileData: any) => {
  return apiCall(`/api/profiles/traveler/${userId}`, 'PATCH', profileData);
};

// Translator profile functions
export const createTranslatorProfile = async (profileData: any) => {
  return apiCall('/api/profiles/translator', 'POST', profileData);
};

export const updateTranslatorProfile = async (profileId: string, profileData: any) => {
  return apiCall(`/api/profiles/translator/${profileId}`, 'PATCH', profileData);
}; 