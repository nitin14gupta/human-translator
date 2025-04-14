import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { createUserProfile } from '@/src/services/api';

interface Language {
  id: string;
  name: string;
  selected: boolean;
}

export default function TranslatorInfoForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    hourlyRate: '',
    languages: [
      { id: '1', name: 'Hindi', selected: false },
      { id: '2', name: 'English', selected: false },
      { id: '3', name: 'Tamil', selected: false },
    ] as Language[]
  });

  const handleSubmit = async () => {
    try {
      // Basic validation
      if (!formData.fullName || !formData.phone || !formData.hourlyRate) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const selectedLanguages = formData.languages.filter(lang => lang.selected);
      if (selectedLanguages.length === 0) {
        Alert.alert('Error', 'Please select at least one language');
        return;
      }

      // Validate hourly rate is a number
      const hourlyRate = parseFloat(formData.hourlyRate);
      if (isNaN(hourlyRate) || hourlyRate <= 0) {
        Alert.alert('Error', 'Please enter a valid hourly rate');
        return;
      }

      setIsSubmitting(true);

      // Prepare data for API
      const profileData = {
        full_name: formData.fullName,
        phone_number: formData.phone,
        hourly_rate: hourlyRate,
        languages: selectedLanguages.map(lang => ({
          language_code: lang.id,
          language_name: lang.name,
          proficiency_level: 'fluent'
        }))
      };

      // Make API call to create profile
      await createUserProfile(profileData);

      // Navigate to translator home
      router.push('/(tabs)/translator');
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert(
        'Error',
        'Failed to create profile. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-neutral-gray-100">
      <LinearGradient
        colors={['#007BFF', '#0056b3']}
        className="pt-12 pb-6 px-5 rounded-b-3xl"
      >
        <Text className="text-white text-2xl font-heading mb-2">Create Profile</Text>
        <Text className="text-white text-opacity-80 font-body">
          Set up your translator profile
        </Text>
      </LinearGradient>

      <View className="p-4 -mt-6">
        <View className="bg-white rounded-2xl shadow-sm p-6">
          {/* Full Name */}
          <View className="mb-6">
            <Text className="text-neutral-gray-800 font-heading mb-2">Full Name *</Text>
            <TextInput
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              className="border border-neutral-gray-200 rounded-xl p-4 bg-white text-neutral-gray-800 font-body"
              placeholder="Enter your full name"
              editable={!isSubmitting}
            />
          </View>

          {/* Phone */}
          <View className="mb-6">
            <Text className="text-neutral-gray-800 font-heading mb-2">Phone Number *</Text>
            <TextInput
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              className="border border-neutral-gray-200 rounded-xl p-4 bg-white text-neutral-gray-800 font-body"
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              editable={!isSubmitting}
            />
          </View>

          {/* Hourly Rate */}
          <View className="mb-6">
            <Text className="text-neutral-gray-800 font-heading mb-2">Hourly Rate (€) *</Text>
            <TextInput
              value={formData.hourlyRate}
              onChangeText={(text) => setFormData({ ...formData, hourlyRate: text })}
              className="border border-neutral-gray-200 rounded-xl p-4 bg-white text-neutral-gray-800 font-body"
              placeholder="Enter your hourly rate"
              keyboardType="numeric"
              editable={!isSubmitting}
            />
          </View>

          {/* Languages */}
          <View>
            <Text className="text-neutral-gray-800 font-heading mb-2">Languages *</Text>
            <View className="flex-row flex-wrap">
              {formData.languages.map((lang) => (
                <TouchableOpacity
                  key={lang.id}
                  className={`mr-2 mb-2 px-4 py-2 rounded-xl border ${
                    lang.selected 
                      ? 'bg-primary border-primary'
                      : 'bg-white border-neutral-gray-200'
                  }`}
                  onPress={() => {
                    if (!isSubmitting) {
                      const newLangs = formData.languages.map(l =>
                        l.id === lang.id ? { ...l, selected: !l.selected } : l
                      );
                      setFormData({ ...formData, languages: newLangs });
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <Text className={`font-body ${
                    lang.selected ? 'text-white' : 'text-neutral-gray-600'
                  }`}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className={`bg-primary mt-6 p-4 rounded-xl ${isSubmitting ? 'opacity-50' : ''}`}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text className="text-white text-center font-heading text-lg">
            {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
          </Text>
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity
          className="mt-4 mb-8"
          onPress={() => router.push('/(tabs)/translator')}
          disabled={isSubmitting}
        >
          <Text className="text-primary text-center font-body">Skip for now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
