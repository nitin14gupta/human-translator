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

// List of languages
const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ru', name: 'Russian' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'tr', name: 'Turkish' },
];

// Proficiency levels
const proficiencyLevels = [
  { key: 'native', label: 'Native' },
  { key: 'fluent', label: 'Fluent' },
  { key: 'advanced', label: 'Advanced' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'beginner', label: 'Beginner' },
];

// Language item type
type LanguageProficiency = {
  language_code: string;
  proficiency_level: string;
  name?: string; // For display purposes
};

export default function TranslatorInfo() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  
  // State variables
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [experienceYears, setExperienceYears] = useState('');
  const [education, setEducation] = useState('');
  const [certificates, setCertificates] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  
  // Language proficiencies
  const [languageProficiencies, setLanguageProficiencies] = useState<LanguageProficiency[]>([]);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedProficiency, setSelectedProficiency] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  // Add language proficiency
  const addLanguageProficiency = () => {
    if (!selectedLanguage || !selectedProficiency) {
      Alert.alert(
        t('translatorInfo.selectBoth'),
        t('translatorInfo.selectBothMessage')
      );
      return;
    }
    
    // Check if language already exists
    const existingLanguage = languageProficiencies.find(
      lp => lp.language_code === selectedLanguage
    );
    
    if (existingLanguage) {
      Alert.alert(
        t('translatorInfo.languageExists'),
        t('translatorInfo.languageExistsMessage')
      );
      return;
    }
    
    // Get language name
    const language = languages.find(l => l.code === selectedLanguage);
    
    // Add new language proficiency
    setLanguageProficiencies([
      ...languageProficiencies,
      {
        language_code: selectedLanguage,
        proficiency_level: selectedProficiency,
        name: language?.name
      }
    ]);
    
    // Reset selection
    setSelectedLanguage(null);
    setSelectedProficiency(null);
    setShowLanguageSelector(false);
  };
  
  // Remove language proficiency
  const removeLanguageProficiency = (langCode: string) => {
    setLanguageProficiencies(
      languageProficiencies.filter(lp => lp.language_code !== langCode)
    );
  };
  
  // Submit profile info
  const handleSubmit = async () => {
    // Validate required fields
    if (!phoneNumber) {
      Alert.alert(
        t('validation.missingFields'),
        t('translatorInfo.phoneNumberRequired')
      );
      return;
    }
    
    if (languageProficiencies.length === 0) {
      Alert.alert(
        t('validation.missingFields'),
        t('translatorInfo.languagesRequired')
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
      
      // Parse numerical values
      const parsedHourlyRate = hourlyRate ? parseFloat(hourlyRate) : 0;
      const parsedExperienceYears = experienceYears ? parseInt(experienceYears, 10) : 0;
      
      // Add profile data
      const profileData = {
        bio,
        phone_number: phoneNumber,
        specialties,
        hourly_rate: parsedHourlyRate,
        is_available: isAvailable,
        experience_years: parsedExperienceYears,
        education,
        certificates,
        emergency_contact: emergencyContact,
        languages: languageProficiencies.map(lp => ({
          language_code: lp.language_code,
          proficiency_level: lp.proficiency_level
        }))
      };
      
      formData.append('profile_data', JSON.stringify(profileData));
      
      // Submit profile
      await createUserProfile(formData);
      
      // Show success message
      Alert.alert(
        t('translatorInfo.profileCreated'),
        t('translatorInfo.profileCreatedMessage'),
        [
          {
            text: t('common.continue'),
            onPress: () => router.replace('/(tabs)/translator')
          }
        ]
      );
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert(
        t('common.error'),
        t('translatorInfo.profileCreateError')
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Skip profile creation
  const skipProfileCreation = () => {
    Alert.alert(
      t('translatorInfo.skipProfile'),
      t('translatorInfo.skipProfileMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('common.continue'),
          onPress: () => router.replace('/(tabs)/translator')
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
        <Text style={styles.title}>{t('translatorInfo.title')}</Text>
        <Text style={styles.subtitle}>{t('translatorInfo.subtitle')}</Text>
        
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
            <Text style={styles.label}>{t('translatorInfo.phoneNumber')} *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#6C757D" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('translatorInfo.phoneNumberPlaceholder')}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>
          
          {/* Language Proficiencies */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('translatorInfo.languageProficiencies')} *</Text>
            
            {/* List of added languages */}
            {languageProficiencies.length > 0 && (
              <View style={styles.languagesList}>
                {languageProficiencies.map((lp, index) => (
                  <View key={index} style={styles.languageItem}>
                    <View style={styles.languageInfo}>
                      <Text style={styles.languageName}>{lp.name}</Text>
                      <Text style={styles.proficiencyLevel}>
                        {proficiencyLevels.find(pl => pl.key === lp.proficiency_level)?.label}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeLanguageProficiency(lp.language_code)}
                    >
                      <Ionicons name="close-circle" size={24} color="#DC3545" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            
            {/* Language Selector */}
            {showLanguageSelector ? (
              <View style={styles.languageSelectorContainer}>
                <View style={styles.selectorRow}>
                  <View style={styles.selector}>
                    <Text style={styles.selectorLabel}>{t('translatorInfo.language')}</Text>
                    <ScrollView style={styles.selectorList} nestedScrollEnabled={true}>
                      {languages.map((language, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.selectorItem,
                            selectedLanguage === language.code && styles.selectorItemSelected
                          ]}
                          onPress={() => setSelectedLanguage(language.code)}
                        >
                          <Text
                            style={[
                              styles.selectorItemText,
                              selectedLanguage === language.code && styles.selectorItemTextSelected
                            ]}
                          >
                            {language.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  
                  <View style={styles.selector}>
                    <Text style={styles.selectorLabel}>{t('translatorInfo.proficiency')}</Text>
                    <ScrollView style={styles.selectorList} nestedScrollEnabled={true}>
                      {proficiencyLevels.map((level, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.selectorItem,
                            selectedProficiency === level.key && styles.selectorItemSelected
                          ]}
                          onPress={() => setSelectedProficiency(level.key)}
                        >
                          <Text
                            style={[
                              styles.selectorItemText,
                              selectedProficiency === level.key && styles.selectorItemTextSelected
                            ]}
                          >
                            {level.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
                
                <View style={styles.selectorButtons}>
                  <TouchableOpacity
                    style={[styles.selectorButton, styles.cancelButton]}
                    onPress={() => {
                      setShowLanguageSelector(false);
                      setSelectedLanguage(null);
                      setSelectedProficiency(null);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.selectorButton,
                      styles.addLanguageButton,
                      (!selectedLanguage || !selectedProficiency) && styles.buttonDisabled
                    ]}
                    onPress={addLanguageProficiency}
                    disabled={!selectedLanguage || !selectedProficiency}
                  >
                    <Text style={styles.addLanguageButtonText}>{t('common.add')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addLanguageBtn}
                onPress={() => setShowLanguageSelector(true)}
              >
                <Ionicons name="add-circle-outline" size={20} color="#0066CC" />
                <Text style={styles.addLanguageBtnText}>{t('translatorInfo.addLanguage')}</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Specialties */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('translatorInfo.specialties')}</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="briefcase-outline" size={20} color="#6C757D" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('translatorInfo.specialtiesPlaceholder')}
                value={specialties}
                onChangeText={setSpecialties}
              />
            </View>
          </View>
          
          {/* Hourly Rate */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('translatorInfo.hourlyRate')}</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="cash-outline" size={20} color="#6C757D" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('translatorInfo.hourlyRatePlaceholder')}
                value={hourlyRate}
                onChangeText={setHourlyRate}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          {/* Availability */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('translatorInfo.availability')}</Text>
            <TouchableOpacity
              style={styles.toggleContainer}
              onPress={() => setIsAvailable(!isAvailable)}
            >
              <View style={[styles.toggle, isAvailable && styles.toggleActive]}>
                <View style={[styles.toggleCircle, isAvailable && styles.toggleCircleActive]} />
              </View>
              <Text style={styles.toggleLabel}>
                {isAvailable 
                  ? t('translatorInfo.availableText')
                  : t('translatorInfo.unavailableText')
                }
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Experience Years */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('translatorInfo.experienceYears')}</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="time-outline" size={20} color="#6C757D" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('translatorInfo.experienceYearsPlaceholder')}
                value={experienceYears}
                onChangeText={setExperienceYears}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          {/* Education */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('translatorInfo.education')}</Text>
            <View style={styles.textareaContainer}>
              <TextInput
                style={styles.textarea}
                placeholder={t('translatorInfo.educationPlaceholder')}
                value={education}
                onChangeText={setEducation}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
          
          {/* Certificates */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('translatorInfo.certificates')}</Text>
            <View style={styles.textareaContainer}>
              <TextInput
                style={styles.textarea}
                placeholder={t('translatorInfo.certificatesPlaceholder')}
                value={certificates}
                onChangeText={setCertificates}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
          
          {/* Emergency Contact */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('translatorInfo.emergencyContact')}</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="alert-circle-outline" size={20} color="#6C757D" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('translatorInfo.emergencyContactPlaceholder')}
                value={emergencyContact}
                onChangeText={setEmergencyContact}
              />
            </View>
          </View>
          
          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('translatorInfo.bio')}</Text>
            <View style={styles.textareaContainer}>
              <TextInput
                style={styles.textarea}
                placeholder={t('translatorInfo.bioPlaceholder')}
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
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E9ECEF',
    padding: 2,
    marginRight: 8,
  },
  toggleActive: {
    backgroundColor: '#0066CC',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  toggleCircleActive: {
    transform: [{ translateX: 20 }],
  },
  toggleLabel: {
    fontSize: 16,
    color: '#212529',
  },
  languagesList: {
    marginBottom: 12,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  proficiencyLevel: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  addLanguageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0066CC',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
  },
  addLanguageBtnText: {
    color: '#0066CC',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  languageSelectorContainer: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  selectorRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  selector: {
    flex: 1,
    marginHorizontal: 4,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#212529',
  },
  selectorList: {
    maxHeight: 150,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  selectorItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  selectorItemSelected: {
    backgroundColor: '#E1F5FE',
  },
  selectorItemText: {
    color: '#212529',
  },
  selectorItemTextSelected: {
    color: '#0066CC',
    fontWeight: '500',
  },
  selectorButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectorButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#CED4DA',
  },
  cancelButtonText: {
    color: '#6C757D',
    fontSize: 14,
    fontWeight: '500',
  },
  addLanguageButton: {
    backgroundColor: '#0066CC',
  },
  addLanguageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.6,
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
