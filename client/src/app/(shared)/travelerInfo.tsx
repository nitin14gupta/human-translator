import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { createUserProfile } from '../../services/api';

// List of common languages travelers might need
const commonLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ko', name: 'Korean' },
  { code: 'hi', name: 'Hindi' },
  { code: 'tr', name: 'Turkish' },
];

export default function TravelerInfo() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  
  // State variables
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationality, setNationality] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [travelPreferences, setTravelPreferences] = useState('');
  const [languagesNeeded, setLanguagesNeeded] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  
  // For language suggestions
  const [languageSuggestions, setLanguageSuggestions] = useState<{code: string, name: string}[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter language suggestions based on input
  useEffect(() => {
    if (languagesNeeded.trim() === '') {
      setLanguageSuggestions([]);
      return;
    }
    
    const filtered = commonLanguages.filter(lang => 
      lang.name.toLowerCase().includes(languagesNeeded.toLowerCase())
    );
    setLanguageSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
  }, [languagesNeeded]);
  
  // Pick image from library
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        t('permissions.mediaLibraryTitle'),
        t('permissions.mediaLibraryMessage')
      );
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
  };
  
  // Take photo with camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        t('permissions.cameraTitle'),
        t('permissions.cameraMessage')
      );
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };
  
  // Select language from suggestions
  const selectLanguage = (language: string) => {
    setLanguagesNeeded(language);
    setLanguageSuggestions([]);
  };
  
  // Add language to the list
  const addLanguage = (language: string) => {
    if (!languagesNeeded.includes(language)) {
      const updatedLanguages = languagesNeeded
        ? `${languagesNeeded}, ${language}`
        : language;
      setLanguagesNeeded(updatedLanguages);
    }
    setLanguageSuggestions([]);
  };
  
  // Submit profile info
  const handleSubmit = async () => {
    // Validate required fields
    if (!phoneNumber) {
      Alert.alert(
        t('validation.missingFields'),
        t('travelerInfo.phoneNumberRequired')
      );
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare form data for multipart/form-data
      const formData = new FormData();
      
      // Add profile image if available
      if (profileImage) {
        const filename = profileImage.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('profile_picture', {
          uri: profileImage,
          name: filename,
          type,
        } as any);
      }
      
      // Add profile data
      const profileData = {
        bio,
        phone_number: phoneNumber,
        nationality,
        current_location: currentLocation,
        emergency_contact: emergencyContact,
        travel_preferences: travelPreferences,
        languages_needed: languagesNeeded,
        dietary_restrictions: dietaryRestrictions,
        medical_conditions: medicalConditions
      };
      
      formData.append('profile_data', JSON.stringify(profileData));
      
      // Submit profile
      await createUserProfile(formData);
      
      // Show success message
      Alert.alert(
        t('travelerInfo.profileCreated'),
        t('travelerInfo.profileCreatedMessage'),
        [
          {
            text: t('common.continue'),
            onPress: () => router.replace('/(tabs)/traveler')
          }
        ]
      );
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert(
        t('common.error'),
        t('travelerInfo.profileCreateError')
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Skip profile creation
  const skipProfileCreation = () => {
    Alert.alert(
      t('travelerInfo.skipProfile'),
      t('travelerInfo.skipProfileMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('common.continue'),
          onPress: () => router.replace('/(tabs)/traveler')
        }
      ]
    );
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>{t('travelerInfo.title')}</Text>
        <Text style={styles.subtitle}>{t('travelerInfo.subtitle')}</Text>
        
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <TouchableOpacity style={styles.profileImage} onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="person" size={60} color="#CCCCCC" />
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Ionicons name="images-outline" size={20} color="#0066CC" />
              <Text style={styles.imageButtonText}>{t('common.gallery')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={20} color="#0066CC" />
              <Text style={styles.imageButtonText}>{t('common.camera')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Form Fields */}
        <View style={styles.form}>
          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('travelerInfo.phoneNumber')} *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#6C757D" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('travelerInfo.phoneNumberPlaceholder')}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>
          
          {/* Nationality */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('travelerInfo.nationality')}</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="flag-outline" size={20} color="#6C757D" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('travelerInfo.nationalityPlaceholder')}
                value={nationality}
                onChangeText={setNationality}
              />
            </View>
          </View>
          
          {/* Current Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('travelerInfo.currentLocation')}</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#6C757D" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('travelerInfo.currentLocationPlaceholder')}
                value={currentLocation}
                onChangeText={setCurrentLocation}
              />
            </View>
          </View>
          
          {/* Languages Needed */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('travelerInfo.languagesNeeded')}</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="chatbox-outline" size={20} color="#6C757D" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('travelerInfo.languagesNeededPlaceholder')}
                value={languagesNeeded}
                onChangeText={setLanguagesNeeded}
              />
            </View>
            {languageSuggestions.length > 0 && (
              <View style={styles.suggestionsList}>
                {languageSuggestions.map((lang, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => addLanguage(lang.name)}
                  >
                    <Text style={styles.suggestionText}>{lang.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          {/* Travel Preferences */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('travelerInfo.travelPreferences')}</Text>
            <View style={styles.textareaContainer}>
              <TextInput
                style={styles.textarea}
                placeholder={t('travelerInfo.travelPreferencesPlaceholder')}
                value={travelPreferences}
                onChangeText={setTravelPreferences}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
          
          {/* Dietary Restrictions */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('travelerInfo.dietaryRestrictions')}</Text>
            <View style={styles.textareaContainer}>
              <TextInput
                style={styles.textarea}
                placeholder={t('travelerInfo.dietaryRestrictionsPlaceholder')}
                value={dietaryRestrictions}
                onChangeText={setDietaryRestrictions}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
          
          {/* Medical Conditions */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('travelerInfo.medicalConditions')}</Text>
            <View style={styles.textareaContainer}>
              <TextInput
                style={styles.textarea}
                placeholder={t('travelerInfo.medicalConditionsPlaceholder')}
                value={medicalConditions}
                onChangeText={setMedicalConditions}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
          
          {/* Emergency Contact */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('travelerInfo.emergencyContact')}</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="alert-circle-outline" size={20} color="#6C757D" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('travelerInfo.emergencyContactPlaceholder')}
                value={emergencyContact}
                onChangeText={setEmergencyContact}
              />
            </View>
          </View>
          
          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('travelerInfo.bio')}</Text>
            <View style={styles.textareaContainer}>
              <TextInput
                style={styles.textarea}
                placeholder={t('travelerInfo.bioPlaceholder')}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.skipButton]}
            onPress={skipProfileCreation}
          >
            <Text style={styles.skipButtonText}>{t('common.skip')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>{t('common.save')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#0066CC',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 24,
    textAlign: 'center',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    padding: 8,
  },
  imageButtonText: {
    marginLeft: 4,
    color: '#0066CC',
    fontSize: 14,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#212529',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#212529',
  },
  textareaContainer: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    padding: 12,
  },
  textarea: {
    height: 100,
    color: '#212529',
  },
  suggestionsList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
    zIndex: 1000,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  suggestionText: {
    color: '#212529',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  skipButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#CED4DA',
  },
  skipButtonText: {
    color: '#6C757D',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#0066CC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
