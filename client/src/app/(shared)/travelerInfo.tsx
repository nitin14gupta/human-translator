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
  Alert,
  Switch
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function TravelerInfo() {
  const { t } = useTranslation();
  const router = useRouter();
  
  // State variables
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [nationality, setNationality] = useState('');
  const [languagesNeeded, setLanguagesNeeded] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  
  // Travel preferences
  const [preferences, setPreferences] = useState({
    localFood: true,
    culturalSites: true,
    shopping: false,
    outdoorActivities: true,
    nightlife: false
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
  
  // Toggle preference
  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key]
    });
  };
  
  // Complete profile setup
  const completeProfile = () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name');
      return;
    }
    
    if (!languagesNeeded.trim()) {
      Alert.alert('Missing Information', 'Please specify languages you need help with');
      return;
    }
    
    // Save profile data
    // In a real app, this would save to a backend or AsyncStorage
    console.log({
      profileImage,
      name,
      nationality,
      languagesNeeded,
      emergencyContact,
      preferences
    });
    
    // Navigate to main app
    router.replace('/(tabs)/traveler');
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
          <Text style={styles.sectionSubtitle}>Which languages do you need help with?</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Enter languages you need help with"
            placeholderTextColor="#939393"
            value={languagesNeeded}
            onChangeText={setLanguagesNeeded}
          />
          <Text style={styles.hint}>(e.g., Japanese, Spanish, French)</Text>
        </View>
        
        {/* Travel Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel Preferences</Text>
          <Text style={styles.sectionSubtitle}>What are you interested in when traveling?</Text>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceTextContainer}>
              <Text style={styles.preferenceName}>Local Food & Restaurants</Text>
              <Text style={styles.preferenceDescription}>Traditional cuisine and dining experiences</Text>
            </View>
            <Switch
              value={preferences.localFood}
              onValueChange={() => togglePreference('localFood')}
              trackColor={{ false: '#D1D1D6', true: '#B3D4FF' }}
              thumbColor={preferences.localFood ? '#0066CC' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceTextContainer}>
              <Text style={styles.preferenceName}>Cultural Sites & Museums</Text>
              <Text style={styles.preferenceDescription}>Historical places and cultural attractions</Text>
            </View>
            <Switch
              value={preferences.culturalSites}
              onValueChange={() => togglePreference('culturalSites')}
              trackColor={{ false: '#D1D1D6', true: '#B3D4FF' }}
              thumbColor={preferences.culturalSites ? '#0066CC' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceTextContainer}>
              <Text style={styles.preferenceName}>Shopping</Text>
              <Text style={styles.preferenceDescription}>Markets, malls, and shopping districts</Text>
            </View>
            <Switch
              value={preferences.shopping}
              onValueChange={() => togglePreference('shopping')}
              trackColor={{ false: '#D1D1D6', true: '#B3D4FF' }}
              thumbColor={preferences.shopping ? '#0066CC' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceTextContainer}>
              <Text style={styles.preferenceName}>Outdoor Activities</Text>
              <Text style={styles.preferenceDescription}>Nature, parks, hiking, and adventure</Text>
            </View>
            <Switch
              value={preferences.outdoorActivities}
              onValueChange={() => togglePreference('outdoorActivities')}
              trackColor={{ false: '#D1D1D6', true: '#B3D4FF' }}
              thumbColor={preferences.outdoorActivities ? '#0066CC' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceTextContainer}>
              <Text style={styles.preferenceName}>Nightlife</Text>
              <Text style={styles.preferenceDescription}>Bars, clubs, and entertainment</Text>
            </View>
            <Switch
              value={preferences.nightlife}
              onValueChange={() => togglePreference('nightlife')}
              trackColor={{ false: '#D1D1D6', true: '#B3D4FF' }}
              thumbColor={preferences.nightlife ? '#0066CC' : '#f4f3f4'}
            />
          </View>
        </View>
        
        {/* Complete Profile Button */}
        <TouchableOpacity style={styles.completeButton} onPress={completeProfile}>
          <Text style={styles.completeButtonText}>Continue</Text>
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
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  preferenceTextContainer: {
    flex: 1,
  },
  preferenceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
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
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});