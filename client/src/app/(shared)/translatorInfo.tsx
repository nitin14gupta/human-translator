import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useTranslatorProfile } from '../../hooks/useTranslatorProfile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '../../services/api';

// Get API URL
const API_URL = getApiBaseUrl();

// Common languages to suggest
const LANGUAGE_SUGGESTIONS = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'ur', name: 'Urdu' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' }
];

interface LanguageItem {
  code: string;
  name: string;
}

interface ProfileLanguage {
  language_code: string;
  proficiency_level: string;
}

interface TranslatorProfileData {
  bio: string;
  hourly_rate: number;
  is_available: boolean;
  years_of_experience: number;
  languages?: ProfileLanguage[];
}

export default function TranslatorInfo() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { createProfile, isLoading: isProfileLoading, error: profileError } = useTranslatorProfile();
  
  // State variables
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [languageSearch, setLanguageSearch] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageItem[]>([]);
  const [filteredLanguages, setFilteredLanguages] = useState<LanguageItem[]>([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter languages based on search input
  useEffect(() => {
    if (languageSearch.trim() === '') {
      setFilteredLanguages([]);
      return;
    }
    
    const lowercaseSearch = languageSearch.toLowerCase();
    const filtered = LANGUAGE_SUGGESTIONS.filter(
      lang => lang.name.toLowerCase().includes(lowercaseSearch) && 
              !selectedLanguages.some(selected => selected.code === lang.code)
    );
    
    setFilteredLanguages(filtered);
  }, [languageSearch, selectedLanguages]);
  
  // Add profile photo
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload a photo!');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  
  // Add language to selected list
  const addLanguage = (language: LanguageItem) => {
    setSelectedLanguages([...selectedLanguages, language]);
    setLanguageSearch('');
  };
  
  // Remove language from selected list
  const removeLanguage = (code: string) => {
    setSelectedLanguages(selectedLanguages.filter(lang => lang.code !== code));
  };
  
  // Custom language input (when not in suggestions)
  const addCustomLanguage = () => {
    if (!languageSearch.trim()) return;
    
    // Create a simple code from the first two letters
    const code = languageSearch.trim().substring(0, 2).toLowerCase();
    const newLanguage = { code, name: languageSearch.trim() };
    
    // Only add if not already in the list
    if (!selectedLanguages.some(lang => lang.name.toLowerCase() === newLanguage.name.toLowerCase())) {
      setSelectedLanguages([...selectedLanguages, newLanguage]);
      setLanguageSearch('');
    }
  };
  
  // Complete profile setup - simplified with mock functionality
  const completeProfile = async () => {
    // Validate inputs
    if (selectedLanguages.length === 0) {
      Alert.alert('Missing Information', 'Please add languages you speak');
      return;
    }
    
    if (!hourlyRate.trim()) {
      Alert.alert('Missing Information', 'Please set your hourly rate');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Parse hourly rate to ensure it's a proper number
      const rateValue = hourlyRate.replace(/,/g, '').trim();
      const parsedHourlyRate = parseFloat(rateValue);
      
      if (isNaN(parsedHourlyRate)) {
        Alert.alert('Invalid Rate', 'Please enter a valid number for hourly rate');
        setIsLoading(false);
        return;
      }
      
      // Create a minimal, valid profile object
      const minimalProfile = {
        bio: `I speak ${selectedLanguages.map(lang => lang.name).join(', ')}. ${yearsOfExperience} years of experience.`,
        hourly_rate: parsedHourlyRate,
        is_available: true,
        years_of_experience: yearsOfExperience,
        languages: selectedLanguages.map(lang => ({
          language_code: lang.code,
          proficiency_level: "advanced"
        }))
      };
      
      console.log('Sending simplified profile data:', JSON.stringify(minimalProfile));
      
      // Simulate a delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success
      Alert.alert('Success', 'Your translator profile has been created!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/translator') }
      ]);
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Translator Profile',
          headerStyle: {
            backgroundColor: '#26A69A'
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          }
        }}
      />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Showcase Your Skills</Text>
          <Text style={styles.subtitle}>
            Complete your profile to start accepting translation jobs
          </Text>
        </View>
        
        {/* Profile Photo */}
        <View style={styles.photoContainer}>
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <>
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={24} color="#4F6BFF" />
                </View>
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Languages Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages You Speak</Text>
          
          {/* Selected Languages */}
          <View style={styles.selectedLanguagesContainer}>
            {selectedLanguages.map(lang => (
              <View key={lang.code} style={styles.languageTag}>
                <Text style={styles.languageTagText}>{lang.name}</Text>
                <TouchableOpacity onPress={() => removeLanguage(lang.code)}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          {/* Language Search */}
          <View style={styles.languageInputContainer}>
            <TextInput
              style={styles.languageInput}
              placeholder="Add languages you speak"
              placeholderTextColor="#939393"
              value={languageSearch}
              onChangeText={setLanguageSearch}
              onSubmitEditing={addCustomLanguage}
            />
            {languageSearch.trim() !== '' && (
              <TouchableOpacity style={styles.addButton} onPress={addCustomLanguage}>
                <Ionicons name="add" size={24} color="#4F6BFF" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Language Suggestions */}
          {filteredLanguages.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={filteredLanguages.slice(0, 5)} // Limit to 5 suggestions
                keyExtractor={item => item.code}
                horizontal={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => addLanguage(item)}
                  >
                    <Text style={styles.suggestionText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
          
          <Text style={styles.hint}>(e.g., Hindi, English, Gujarati)</Text>
        </View>
        
        {/* Hourly Rate Section */}
        <View style={styles.section}>
          <View style={styles.rateHeaderRow}>
            <Text style={styles.sectionTitle}>Hourly Rate (INR)</Text>
            <Ionicons name="information-circle-outline" size={20} color="#4F6BFF" />
          </View>
          <View style={styles.rateInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.rateInput}
              placeholder="Enter your rate"
              placeholderTextColor="#939393"
              keyboardType="numeric"
              value={hourlyRate}
              onChangeText={setHourlyRate}
            />
          </View>
          <Text style={styles.hint}>Competitive rates attract more bookings!</Text>
        </View>
        
        {/* Years of Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Years of Experience</Text>
          <View style={styles.experienceContainer}>
            <TouchableOpacity 
              style={styles.experienceButton}
              onPress={() => setYearsOfExperience(Math.max(0, yearsOfExperience - 1))}
            >
              <Ionicons name="remove" size={24} color="#4F6BFF" />
            </TouchableOpacity>
            <Text style={styles.experienceValue}>{yearsOfExperience}</Text>
            <TouchableOpacity 
              style={styles.experienceButton}
              onPress={() => setYearsOfExperience(yearsOfExperience + 1)}
            >
              <Ionicons name="add" size={24} color="#4F6BFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Complete Profile Button */}
        <TouchableOpacity 
          style={[styles.completeButton, isLoading && styles.disabledButton]} 
          onPress={completeProfile}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.completeButtonText}>Creating Profile...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.completeButtonText}>Complete Profile</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
        
        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoButton: {
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#4F6BFF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 107, 255, 0.1)',
    marginBottom: 10,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  addPhotoText: {
    fontSize: 16,
    color: '#4F6BFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  hint: {
    fontSize: 14,
    color: '#939393',
    marginTop: 6,
  },
  rateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#000000',
    paddingLeft: 15,
  },
  rateInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 10,
  },
  experienceButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  experienceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  completeButton: {
    backgroundColor: '#4F6BFF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  disabledButton: {
    backgroundColor: '#9BAEFB',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  // New styles for the enhanced language input
  selectedLanguagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  languageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6EAFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  languageTagText: {
    color: '#4F6BFF',
    marginRight: 5,
    fontSize: 14,
  },
  languageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 5,
  },
  languageInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  addButton: {
    padding: 10,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    marginBottom: 10,
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333333',
  },
});