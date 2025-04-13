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

// Define register data type
type RegisterData = {
  name: string;
  email: string;
  password: string;
  confirm_password?: string;
  is_traveler: boolean;
  preferred_language: string;
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
        // First check if we have valid tokens in storage
        const token = await AsyncStorage.getItem('authToken');
        
        if (token) {
          console.log('Auth token found on startup, loading user data');
          const userData = await getUserFromStorage();
          if (userData) {
            console.log('User data successfully loaded from storage');
            setUser(userData);
          } else {
            console.log('Token exists but failed to load user data');
            // If we have a token but can't load user data, don't fail silently
            // This helps prevent authentication issues
            await clearAuthData();
          }
        } else {
          console.log('No auth token found on startup');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // On error, clear auth data to prevent being stuck in a bad state
        await clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Helper function to clear all auth data
  const clearAuthData = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('isNeedTranslator');
      setUser(null);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  // Helper function to get user from storage
  const getUserFromStorage = async (): Promise<User | null> => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const isTravelerStr = await AsyncStorage.getItem('isNeedTranslator');
      const email = await AsyncStorage.getItem('userEmail');
      const name = await AsyncStorage.getItem('userName');
      
      if (!userId) {
        console.log('No user ID found in storage');
        return null;
      }
      
      // Try to fetch fresh user data from API
      try {
        const headers = await createAuthHeaders();
        const userData = await apiFetch('/api/users/me', {
          method: 'GET',
          headers,
        });
        
        // Store email and name for future use
        if (userData.email) await AsyncStorage.setItem('userEmail', userData.email);
        if (userData.name) await AsyncStorage.setItem('userName', userData.name);
        
        return {
          id: userId,
          email: userData.email,
          name: userData.name,
          isTraveler: isTravelerStr === 'true',
          preferredLanguage: userData.preferred_language,
        };
      } catch (apiError) {
        console.error('API error fetching user data:', apiError);
        
        // If API fails but we have basic info cached, return that
        // This allows offline login with cached credentials
        if (email && name) {
          console.log('Using cached user data');
          return {
            id: userId,
            email,
            name,
            isTraveler: isTravelerStr === 'true',
            preferredLanguage: await AsyncStorage.getItem('preferredLanguage') || 'en',
          };
        }
        
        return null;
      }
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
        await AsyncStorage.setItem('refreshToken', data.refresh_token);
        await AsyncStorage.setItem('userId', data.user_id.toString());
        await AsyncStorage.setItem('isNeedTranslator', data.is_traveler.toString());
        await AsyncStorage.setItem('preferredLanguage', data.preferred_language);
        
        // Save additional user data to improve persistence
        await AsyncStorage.setItem('userEmail', email);
        await AsyncStorage.setItem('userName', data.name || '');
        
        // Set user data
        setUser({
          id: data.user_id.toString(),
          email: email,
          name: data.name || '',
          isTraveler: data.is_traveler,
          preferredLanguage: data.preferred_language,
        });
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
      // Get selected language from storage if not provided
      if (!userData.preferred_language) {
        const savedLanguage = await AsyncStorage.getItem('userLanguage');
        if (savedLanguage) {
          userData.preferred_language = savedLanguage;
        } else {
          userData.preferred_language = 'en'; // Default to English
        }
      }
      
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
        await AsyncStorage.setItem('refreshToken', data.refresh_token);
        await AsyncStorage.setItem('userId', data.user_id.toString());
        await AsyncStorage.setItem('isNeedTranslator', userData.is_traveler.toString());
        await AsyncStorage.setItem('preferredLanguage', userData.preferred_language);
        // Save additional user data for persistence
        await AsyncStorage.setItem('userEmail', userData.email);
        await AsyncStorage.setItem('userName', userData.name);
        
        // Add flag to indicate this is a new user who needs to set up profile
        await AsyncStorage.setItem('needsProfileSetup', 'true');
        
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
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      // Try to call logout API if refresh token exists, but don't block on failure
      if (refreshToken) {
        try {
          await apiFetch('/api/logout', {
            method: 'POST',
            headers: await createAuthHeaders(),
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
        } catch (apiError) {
          // Log but don't throw the error - we still want to clear local data
          console.warn('Error calling logout API:', apiError);
        }
      }
      
      // Always clear local data regardless of API call success
      await clearAuthData();
      
      // Clear additional user data
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userName');
      await AsyncStorage.removeItem('preferredLanguage');
    } catch (error) {
      console.error('Error clearing local data during logout:', error);
      // Only throw if we couldn't clear local data
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
