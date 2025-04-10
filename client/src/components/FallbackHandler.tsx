import React, { useState, useEffect, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import NoInternetScreen from '../app/(shared)/fallbacks/NoInternetScreen';
import SessionExpiredScreen from '../app/(shared)/fallbacks/SessionExpiredScreen';
import MaintenanceScreen from '../app/(shared)/fallbacks/MaintenanceScreen';
import ErrorScreen from '../app/(shared)/fallbacks/ErrorScreen';
import { useRouter } from 'expo-router';
import { setOfflineStatus, setMaintenanceStatus } from '../services/api';

type FallbackHandlerProps = {
  children: ReactNode;
};

// JWT token payload interface
interface TokenPayload {
  exp: number;
  // other token fields...
}

export default function FallbackHandler({ children }: FallbackHandlerProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(false);
  const [maintenanceTime, setMaintenanceTime] = useState<string>('');
  const [error, setError] = useState<{ isError: boolean; message?: string; code?: string }>({
    isError: false,
  });
  
  const router = useRouter();

  // Check network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      // Update the API's offline status
      setOfflineStatus(state.isConnected === false);
    });

    // Initial check
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      // Update the API's offline status
      setOfflineStatus(state.isConnected === false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Check session expiry whenever app comes to foreground
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        
        if (!token) {
          return; // No token, user not logged in yet
        }
        
        const decodedToken = jwtDecode<TokenPayload>(token);
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (decodedToken.exp < currentTime) {
          setIsSessionExpired(true);
        } else {
          setIsSessionExpired(false);
        }
      } catch (error) {
        console.error('Error checking token:', error);
      }
    };

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkToken();
      }
    });
    
    // Initial check
    checkToken();

    return () => {
      subscription.remove();
    };
  }, []);

  // Check for maintenance mode or other server status
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // In a real app, replace with your actual API endpoint
        const response = await fetch('https://api.humantranslator.app/status');
        const data = await response.json();
        
        if (data.maintenance) {
          setIsMaintenanceMode(true);
          setMaintenanceTime(data.estimatedResolution || '30 minutes');
          // Update the API's maintenance status
          setMaintenanceStatus(true);
        } else {
          setIsMaintenanceMode(false);
          // Update the API's maintenance status
          setMaintenanceStatus(false);
        }
      } catch (error) {
        // If we can't reach the status endpoint, it might be a network issue
        // But we're already handling that with NetInfo
        console.error('Error checking server status:', error);
      }
    };

    // Check server status when app loads and every 5 minutes
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Handle retrying network connection
  const handleRetryConnection = () => {
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
    });
  };

  // Handle login after session expiration
  const handleLogin = () => {
    setIsSessionExpired(false);
    // Clear the expired token
    AsyncStorage.removeItem('authToken');
    // Navigate to the login screen
    router.replace('/');
  };

  // Handle checking maintenance status
  const checkMaintenanceStatus = () => {
    // Re-fetch server status
    fetch('https://api.humantranslator.app/status')
      .then(response => response.json())
      .then(data => {
        if (!data.maintenance) {
          setIsMaintenanceMode(false);
        }
      })
      .catch(err => console.error('Error checking maintenance status:', err));
  };

  // Show appropriate fallback screen based on conditions
  if (!isConnected) {
    return <NoInternetScreen onRetry={handleRetryConnection} />;
  }

  if (isSessionExpired) {
    return <SessionExpiredScreen onLogin={handleLogin} />;
  }

  if (isMaintenanceMode) {
    return (
      <MaintenanceScreen 
        estimatedTime={maintenanceTime} 
        onRefresh={checkMaintenanceStatus}
      />
    );
  }

  if (error.isError) {
    return (
      <ErrorScreen
        title={error.message ? undefined : undefined}
        message={error.message}
        errorCode={error.code}
        onRetry={() => setError({ isError: false })}
        onGoHome={() => {
          setError({ isError: false });
          router.replace('/');
        }}
      />
    );
  }

  // Pass the error setter to children via context
  return (
    <ErrorHandlerContext.Provider value={{ setError }}>
      {children}
    </ErrorHandlerContext.Provider>
  );
}

// Context for error handling throughout the app
interface ErrorContextValue {
  setError: React.Dispatch<React.SetStateAction<{
    isError: boolean;
    message?: string;
    code?: string;
  }>>;
}

export const ErrorHandlerContext = React.createContext<ErrorContextValue>({
  setError: () => {},
});

// Hook to use the error handler
export const useErrorHandler = () => React.useContext(ErrorHandlerContext); 