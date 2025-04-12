import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

// Language storage key
const LANGUAGE_STORAGE_KEY = 'userLanguage';

// Function to change the app language and save to AsyncStorage
export const changeLanguage = async (language: string): Promise<boolean> => {
  try {
    // Save to AsyncStorage
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    
    // Change i18n language
    await i18n.changeLanguage(language);
    
    return true;
  } catch (error) {
    console.error('Error changing language:', error);
    return false;
  }
};

// Function to get the current language from AsyncStorage
export const getLanguage = async (): Promise<string> => {
  try {
    // Try to get from AsyncStorage
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    
    // Return saved language or default language
    return savedLanguage || i18n.language || 'en';
  } catch (error) {
    console.error('Error getting language:', error);
    return i18n.language || 'en';
  }
}; 