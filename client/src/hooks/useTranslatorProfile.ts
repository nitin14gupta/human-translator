import { useState } from 'react';
import { createTranslatorProfile, updateTranslatorProfile } from '../services/api';

interface TranslatorProfileData {
  bio: string;
  hourly_rate: number;
  is_available: boolean;
  years_of_experience: number;
  languages?: { language_code: string; proficiency_level: string }[];
}

export const useTranslatorProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create translator profile
  const createProfile = async (profileData: TranslatorProfileData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Creating translator profile with data:', profileData);
      // Simulate a successful profile creation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      return { success: true };
    } catch (err) {
      console.error('Error creating translator profile:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update translator profile
  const updateProfile = async (profileId: string, profileData: Partial<TranslatorProfileData>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Updating translator profile ${profileId} with data:`, profileData);
      // Simulate a successful profile update
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      return { success: true };
    } catch (err) {
      console.error('Error updating translator profile:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createProfile,
    updateProfile,
    isLoading,
    error
  };
}; 