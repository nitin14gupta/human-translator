import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser, resetPassword as resetPasswordApi, getUserType as getUserTypeApi } from '../services/api';

// Define auth tokens storage keys
const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

// User type interface
interface User {
  id: string;
  name: string;
  email: string;
  is_traveler: boolean;
  preferred_language?: string;
  profile_image?: string;
}

// Registration data interface
interface RegistrationData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  is_traveler: boolean;
  preferred_language?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  getUserType: () => Promise<'traveler' | 'translator' | null>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Load user data and token from storage on component mount
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        const storedUserData = await AsyncStorage.getItem(USER_DATA_KEY);

        if (storedToken && storedUserData) {
          setToken(storedToken);
          setUser(JSON.parse(storedUserData));
        }
      } catch (error) {
        console.error('Error loading auth data from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Get user type (traveler or translator)
  const getUserType = async (): Promise<'traveler' | 'translator' | null> => {
    if (!user) return null;
    
    try {
      // Use the API to get user type
      const response = await getUserTypeApi();
      return response.user_type;
    } catch (error) {
      console.error('Error getting user type:', error);
      // Fallback to local data
      return user.is_traveler ? 'traveler' : 'translator';
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Call the login API
      const response = await loginUser({ email, password });
      
      // Save to state
      setToken(response.token);
      setUser(response.user);
      
      // Save to storage
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: RegistrationData): Promise<void> => {
    setIsLoading(true);
    try {
      // Call the register API
      const response = await registerUser(data);
      
      // Save to state
      setToken(response.token);
      setUser(response.user);
      
      // Save to storage
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Clear storage
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
      
      // Clear state
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Password reset function
  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Call the reset password API
      await resetPasswordApi(email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!user || !token) {
      throw new Error('Not authenticated');
    }

    setIsLoading(true);
    try {
      // For now, we just update local state and storage
      // In a real app, you would call an API endpoint to update the user data
      
      // Update state with merged user data
      const updatedUser = {
        ...user,
        ...userData,
      };
      
      setUser(updatedUser);
      
      // Update storage
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    resetPassword,
    updateUser,
    getUserType,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
