import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';
import { updateUserLanguage, getUserLanguage } from './api';

// Local storage key for language preference
const LANGUAGE_STORAGE_KEY = 'userLanguage';

// Check if user is authenticated
const isAuthenticated = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem('authToken');
  return !!token;
};

// Set language locally
const setLanguageLocally = async (language: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error setting language locally:', error);
  }
};

// Update language in the app and on the server if authenticated
export const changeLanguage = async (language: string): Promise<boolean> => {
  try {
    // Always update locally first
    await setLanguageLocally(language);
    
    // If the user is authenticated, also update on the server
    if (await isAuthenticated()) {
      try {
        await updateUserLanguage(language);
      } catch (error) {
        console.warn('Failed to update language on server:', error);
        // Continue without failing, we already updated locally
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error changing language:', error);
    return false;
  }
};

// Get language - first try server, then local storage, default to 'en'
export const getLanguage = async (): Promise<string> => {
  try {
    // If user is authenticated, try to get from server first
    if (await isAuthenticated()) {
      try {
        const response = await getUserLanguage();
        return response.preferred_language;
      } catch (error) {
        console.warn('Failed to get language from server:', error);
        // Fall through to local storage
      }
    }
    
    // Get from local storage
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return storedLanguage || 'en';
  } catch (error) {
    console.error('Error getting language:', error);
    return 'en'; // Default fallback
  }
};

// Load and apply saved language
export const loadSavedLanguage = async (): Promise<void> => {
  try {
    const savedLanguage = await getLanguage();
    if (savedLanguage) {
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error('Error loading saved language:', error);
  }
}; 