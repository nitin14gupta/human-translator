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
  Alert,
  FlatList
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { createUserProfile } from '../../services/api';

// Indian languages list
const indianLanguages = [
  "Hindi", "Bengali", "Telugu", "Marathi", "Tamil", "Urdu", "Gujarati", 
  "Kannada", "Malayalam", "Odia", "Punjabi", "Assamese", "Maithili", 
  "Sanskrit", "Santali", "Kashmiri", "Nepali", "Konkani", "Sindhi", 
  "Dogri", "Manipuri", "Bodo"
];

export default function TravelerInfo() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  
  // State variables
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState(user?.name || '');
  const [nationality, setNationality] = useState('');
  const [languagesNeeded, setLanguagesNeeded] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [languageSuggestions, setLanguageSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter languages based on input
  useEffect(() => {
    if (languagesNeeded.trim()) {
      const filteredLanguages = indianLanguages.filter(
        language => language.toLowerCase().includes(languagesNeeded.toLowerCase())
      );
      setLanguageSuggestions(filteredLanguages);
    } else {
      setLanguageSuggestions([]);
    }
  }, [languagesNeeded]);
  
  // Add language to the input
  const selectLanguage = (language: string) => {
    // Check if there are already languages in the input
    if (languagesNeeded.trim().includes(',')) {
      // Extract the languages as a list
      const languages = languagesNeeded.split(',').map(l => l.trim());
      // Remove the last partially-typed language
      languages.pop();
      // Add the selected language
      languages.push(language);
      // Join back with commas
      setLanguagesNeeded(languages.join(', '));
    } else {
      // First language being added
      setLanguagesNeeded(language);
    }
    // Clear suggestions
    setLanguageSuggestions([]);
  };
  
  // Start typing a new language
  const startNewLanguage = () => {
    if (languagesNeeded && !languagesNeeded.endsWith(', ')) {
      setLanguagesNeeded(languagesNeeded + ', ');
    }
  };
  
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
  
  // Complete profile setup - simplified with mock functionality
  const completeProfile = async () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name');
      return;
    }
    
    if (!languagesNeeded.trim()) {
      Alert.alert('Missing Information', 'Please specify languages you need help with');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare profile data
      const profileData = {
        bio: `Nationality: ${nationality || 'Not specified'}`,
        current_location: '',
        travel_preferences: `Languages needed: ${languagesNeeded}, Emergency contact: ${emergencyContact}`,
        // If we had an endpoint for profile image, we would include it here
      };
      
      // Log profile data
      console.log('Creating traveler profile with data:', profileData);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success
      Alert.alert('Success', 'Your traveler profile has been created!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/traveler') }
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
          title: 'Traveler Profile',
          headerStyle: {
            backgroundColor: '#0066CC'
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          }
        }}
      />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Traveler Profile</Text>
          <Text style={styles.subtitle}>
            Help us personalize your translation experience
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
                  <Ionicons name="person" size={24} color="#0066CC" />
                </View>
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#939393"
              value={name}
              onChangeText={setName}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nationality</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your nationality"
              placeholderTextColor="#939393"
              value={nationality}
              onChangeText={setNationality}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Emergency Contact</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone number of someone we can contact"
              placeholderTextColor="#939393"
              keyboardType="phone-pad"
              value={emergencyContact}
              onChangeText={setEmergencyContact}
            />
            <Text style={styles.hint}>In case of emergency during your travels</Text>
          </View>
        </View>
        
        {/* Language Needs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Translation Needs</Text>
          <Text style={styles.sectionSubtitle}>Which languages do you need help with in India?</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Enter languages you need help with"
            placeholderTextColor="#939393"
            value={languagesNeeded}
            onChangeText={setLanguagesNeeded}
            onEndEditing={() => startNewLanguage()}
          />
          <Text style={styles.hint}>Start typing to see language suggestions</Text>
          
          {languageSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={languageSuggestions}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.suggestionItem}
                    onPress={() => selectLanguage(item)}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
                horizontal={false}
                style={styles.suggestionsList}
              />
            </View>
          )}
        </View>
        
        {/* Complete Profile Button */}
        <TouchableOpacity 
          style={[styles.completeButton, isLoading && styles.disabledButton]} 
          onPress={completeProfile}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.completeButtonText}>Creating Profile...</Text>
          ) : (
            <>
              <Text style={styles.completeButtonText}>Continue</Text>
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
    borderColor: '#0066CC',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
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
    color: '#0066CC',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
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
  suggestionsContainer: {
    marginTop: 8,
    maxHeight: 150,
  },
  suggestionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333333',
  },
  completeButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#99C2E5',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});