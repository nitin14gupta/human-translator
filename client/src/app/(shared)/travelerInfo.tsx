import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TravelerInfoForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    email: '',
    phone: '',
    nationality: '',

    // Travel Details
    arrivalDate: '',
    departureDate: '',
    cities: [
      { id: '1', name: 'Mumbai', selected: false },
      { id: '2', name: 'Delhi', selected: false },
      { id: '3', name: 'Bangalore', selected: false },
      { id: '4', name: 'Chennai', selected: false },
      { id: '5', name: 'Kolkata', selected: false },
    ],

    // Language Preferences
    languages: [
      { id: '1', name: 'Hindi', selected: false },
      { id: '2', name: 'Tamil', selected: false },
      { id: '3', name: 'Telugu', selected: false },
      { id: '4', name: 'Bengali', selected: false },
      { id: '5', name: 'Marathi', selected: false },
    ],

    // Preferences
    preferredGender: 'any',
    notifications: {
      email: true,
      sms: false,
      inApp: true,
    },
  });

  const handleSubmit = () => {
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    // Submit form and navigate
    router.push('/(tabs)/traveler');
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Create Profile</Text>
        <Text className="text-gray-600 mt-1">Tell us about your travel needs</Text>
      </View>

      {/* Personal Details */}
      <View className="bg-white mt-4 p-4">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Personal Details</Text>
        
        <View className="mb-4">
          <Text className="text-gray-600 mb-2">Full Name *</Text>
          <TextInput
            value={formData.fullName}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            className="border border-gray-200 rounded-xl p-3 bg-white text-gray-900"
            placeholder="Enter your full name"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-600 mb-2">Email *</Text>
          <TextInput
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            className="border border-gray-200 rounded-xl p-3 bg-white text-gray-900"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-600 mb-2">Phone Number *</Text>
          <TextInput
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            className="border border-gray-200 rounded-xl p-3 bg-white text-gray-900"
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-600 mb-2">Nationality</Text>
          <TextInput
            value={formData.nationality}
            onChangeText={(text) => setFormData({ ...formData, nationality: text })}
            className="border border-gray-200 rounded-xl p-3 bg-white text-gray-900"
            placeholder="Enter your nationality"
          />
        </View>
      </View>

      {/* Travel Details */}
      <View className="bg-white mt-4 p-4">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Travel Details</Text>

        <View className="mb-4">
          <Text className="text-gray-600 mb-2">Arrival Date</Text>
          <TextInput
            value={formData.arrivalDate}
            onChangeText={(text) => setFormData({ ...formData, arrivalDate: text })}
            className="border border-gray-200 rounded-xl p-3 bg-white text-gray-900"
            placeholder="DD/MM/YYYY"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-600 mb-2">Departure Date</Text>
          <TextInput
            value={formData.departureDate}
            onChangeText={(text) => setFormData({ ...formData, departureDate: text })}
            className="border border-gray-200 rounded-xl p-3 bg-white text-gray-900"
            placeholder="DD/MM/YYYY"
          />
        </View>

        <Text className="text-gray-600 mb-2">Cities to Visit</Text>
        <View className="flex-row flex-wrap">
          {formData.cities.map((city) => (
            <TouchableOpacity
              key={city.id}
              className={`m-1 px-4 py-2 rounded-full border ${
                city.selected 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
              onPress={() => {
                const newCities = formData.cities.map(c =>
                  c.id === city.id ? { ...c, selected: !c.selected } : c
                );
                setFormData({ ...formData, cities: newCities });
              }}
            >
              <Text className={`${
                city.selected ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {city.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Language Preferences */}
      <View className="bg-white mt-4 p-4">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Language Preferences</Text>
        
        <Text className="text-gray-600 mb-2">Languages Needed</Text>
        <View className="flex-row flex-wrap">
          {formData.languages.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              className={`m-1 px-4 py-2 rounded-full border ${
                lang.selected 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
              onPress={() => {
                const newLangs = formData.languages.map(l =>
                  l.id === lang.id ? { ...l, selected: !l.selected } : l
                );
                setFormData({ ...formData, languages: newLangs });
              }}
            >
              <Text className={`${
                lang.selected ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mt-4">
          <Text className="text-gray-600 mb-2">Preferred Translator Gender</Text>
          <View className="flex-row">
            {['any', 'male', 'female'].map((gender) => (
              <TouchableOpacity
                key={gender}
                className={`mr-2 px-4 py-2 rounded-full border ${
                  formData.preferredGender === gender
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
                onPress={() => setFormData({ ...formData, preferredGender: gender })}
              >
                <Text className={`capitalize ${
                  formData.preferredGender === gender
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}>
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Notification Preferences */}
      <View className="bg-white mt-4 p-4">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Notifications</Text>
        
        {Object.entries(formData.notifications).map(([key, value]) => (
          <View key={key} className="flex-row items-center justify-between py-2">
            <Text className="text-gray-900 capitalize">
              {key === 'inApp' ? 'In-App Notifications' : `${key} Notifications`}
            </Text>
            <Switch
              value={value}
              onValueChange={(newValue) =>
                setFormData({
                  ...formData,
                  notifications: {
                    ...formData.notifications,
                    [key]: newValue,
                  },
                })
              }
            />
          </View>
        ))}
      </View>

      {/* Submit Button */}
      <View className="p-4">
        <TouchableOpacity
          className="bg-blue-600 p-4 rounded-xl"
          onPress={handleSubmit}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Create Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Skip Button */}
      <TouchableOpacity
        className="px-4 py-3 mb-8"
        onPress={() => router.push('/(tabs)/traveler')}
      >
        <Text className="text-blue-600 text-center">Skip for now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
