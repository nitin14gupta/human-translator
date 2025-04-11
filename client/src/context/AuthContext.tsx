import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../services/api';

// Define user data type
type User = {
  id: string;
  email: string;
  name: string;
  isTraveler: boolean;
  preferredLanguage: string;
};

// Define auth context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (token: string, newPassword: string) => Promise<void>;
  getUserType: () => Promise<'traveler' | 'translator' | null>;
  updateLanguage: (language: string) => Promise<void>;
};

// Define register data type
type RegisterData = {
  email: string;
  name: string;
  password: string;
  confirm_password?: string;
  is_traveler: boolean;
  preferred_language: string;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  confirmResetPassword: async () => {},
  getUserType: async () => null,
  updateLanguage: async () => {},
});

// AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getUserFromStorage();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Helper function to get user from storage
  const getUserFromStorage = async (): Promise<User | null> => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const isTravelerStr = await AsyncStorage.getItem('isNeedTranslator');
      
      if (!userId) return null;
      
      // Fetch user profile from API
      const headers = await createAuthHeaders();
      const userData = await apiFetch('/users/me', {
        method: 'GET',
        headers,
      });
      
      return {
        id: userId,
        email: userData.email,
        name: userData.name,
        isTraveler: isTravelerStr === 'true',
        preferredLanguage: userData.preferred_language,
      };
    } catch (error) {
      console.error('Error getting user from storage:', error);
      return null;
    }
  };

  // Create authenticated headers
  const createAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('authToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiFetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      
      // Save token and user info
      if (data.access_token) {
        await AsyncStorage.setItem('authToken', data.access_token);
        await AsyncStorage.setItem('userId', data.user_id.toString());
        await AsyncStorage.setItem('isNeedTranslator', data.is_traveler.toString());
        
        // Get user profile
        const userData = await getUserFromStorage();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const data = await apiFetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      // If registration automatically logs in the user
      if (data.access_token) {
        await AsyncStorage.setItem('authToken', data.access_token);
        await AsyncStorage.setItem('userId', data.user_id.toString());
        await AsyncStorage.setItem('isNeedTranslator', userData.is_traveler.toString());
        
        setUser({
          id: data.user_id.toString(),
          email: userData.email,
          name: userData.name,
          isTraveler: userData.is_traveler,
          preferredLanguage: userData.preferred_language,
        });
      }
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      // Remove token and user info from storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('isNeedTranslator');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      return await apiFetch('/api/reset-password-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  };

  // Confirm password reset function
  const confirmResetPassword = async (token: string, newPassword: string) => {
    try {
      return await apiFetch('/api/reset-password-confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: newPassword,
        }),
      });
    } catch (error) {
      console.error('Error confirming password reset:', error);
      throw error;
    }
  };

  // Get user type function
  const getUserType = async (): Promise<'traveler' | 'translator' | null> => {
    try {
      const isTravelerStr = await AsyncStorage.getItem('isNeedTranslator');
      if (isTravelerStr === null) return null;
      
      return isTravelerStr === 'true' ? 'traveler' : 'translator';
    } catch (error) {
      console.error('Error getting user type:', error);
      return null;
    }
  };

  // Update language preference
  const updateLanguage = async (language: string) => {
    try {
      // Set language preference locally first
      await AsyncStorage.setItem('userLanguage', language);
      
      // If user is logged in, update on server
      if (user) {
        const headers = await createAuthHeaders();
        const data = await apiFetch('/api/users/me', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ preferred_language: language }),
        });
        
        // Update user object with new language preference
        setUser({
          ...user,
          preferredLanguage: language,
        });
      }
    } catch (error) {
      console.error('Error updating language:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        resetPassword,
        confirmResetPassword,
        getUserType,
        updateLanguage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
