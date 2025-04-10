import React, { useState } from 'react';
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
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function TranslatorInfo() {
  const { t } = useTranslation();
  const router = useRouter();
  
  // State variables
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [languages, setLanguages] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [specializations, setSpecializations] = useState({
    legal: false,
    medical: false,
    technical: false,
    literary: false
  });
  
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
  
  // Toggle specialization
  const toggleSpecialization = (key: keyof typeof specializations) => {
    setSpecializations({
      ...specializations,
      [key]: !specializations[key]
    });
  };
  
  // Complete profile setup
  const completeProfile = () => {
    // Validate inputs
    if (!languages.trim()) {
      Alert.alert('Missing Information', 'Please add languages you speak');
      return;
    }
    
    if (!hourlyRate.trim()) {
      Alert.alert('Missing Information', 'Please set your hourly rate');
      return;
    }
    
    // Save profile data
    // In a real app, this would save to a backend or AsyncStorage
    console.log({
      profileImage,
      languages,
      hourlyRate,
      yearsOfExperience,
      specializations
    });
    
    // Navigate to main app
    router.replace('/(tabs)/translator');
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
          <TextInput
            style={styles.input}
            placeholder="Add languages you speak"
            placeholderTextColor="#939393"
            value={languages}
            onChangeText={setLanguages}
          />
          <Text style={styles.hint}>(e.g., French, Gujarati)</Text>
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
        
        {/* Specializations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specializations</Text>
          <View style={styles.specializationsContainer}>
            <TouchableOpacity 
              style={[
                styles.specializationButton,
                specializations.legal && styles.specializationButtonActive
              ]}
              onPress={() => toggleSpecialization('legal')}
            >
              <Text style={[
                styles.specializationText,
                specializations.legal && styles.specializationTextActive
              ]}>Legal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.specializationButton,
                specializations.medical && styles.specializationButtonActive
              ]}
              onPress={() => toggleSpecialization('medical')}
            >
              <Text style={[
                styles.specializationText,
                specializations.medical && styles.specializationTextActive
              ]}>Medical</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.specializationButton,
                specializations.technical && styles.specializationButtonActive
              ]}
              onPress={() => toggleSpecialization('technical')}
            >
              <Text style={[
                styles.specializationText,
                specializations.technical && styles.specializationTextActive
              ]}>Technical</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.specializationButton,
                specializations.literary && styles.specializationButtonActive
              ]}
              onPress={() => toggleSpecialization('literary')}
            >
              <Text style={[
                styles.specializationText,
                specializations.literary && styles.specializationTextActive
              ]}>Literary</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Complete Profile Button */}
        <TouchableOpacity style={styles.completeButton} onPress={completeProfile}>
          <Text style={styles.completeButtonText}>Complete Profile</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
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
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  specializationButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#F0F0F0',
  },
  specializationButtonActive: {
    backgroundColor: '#4F6BFF',
  },
  specializationText: {
    fontSize: 14,
    color: '#333333',
  },
  specializationTextActive: {
    color: '#FFFFFF',
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
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});