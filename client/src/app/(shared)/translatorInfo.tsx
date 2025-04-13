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

export default function TranslatorInfoForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    hourlyRate: '',

    // Languages
    languages: [
      { id: '1', name: 'Hindi', level: 'native', selected: false },
      { id: '2', name: 'English', level: 'fluent', selected: false },
      { id: '3', name: 'Tamil', level: 'intermediate', selected: false },
      { id: '4', name: 'Telugu', level: 'intermediate', selected: false },
      { id: '5', name: 'Bengali', level: 'intermediate', selected: false },
    ],

    // Specializations
    specializations: [
      { id: '1', name: 'Tourism & Culture', selected: false },
      { id: '2', name: 'Business', selected: false },
      { id: '3', name: 'Medical', selected: false },
      { id: '4', name: 'Technical', selected: false },
    ],

    // Availability
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },

    // Preferences
    notifications: {
      email: true,
      sms: false,
      inApp: true,
    },
  });

  const handleSubmit = () => {
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.hourlyRate) {
      alert('Please fill in all required fields');
      return;
    }

    // Submit form and navigate
    router.push('/(tabs)/translator');
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Create Profile</Text>
        <Text className="text-gray-600 mt-1">Set up your translator profile</Text>
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
          <Text className="text-gray-600 mb-2">Bio</Text>
          <TextInput
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            className="border border-gray-200 rounded-xl p-3 bg-white text-gray-900"
            placeholder="Tell travelers about yourself"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-600 mb-2">Hourly Rate (€) *</Text>
          <TextInput
            value={formData.hourlyRate}
            onChangeText={(text) => setFormData({ ...formData, hourlyRate: text })}
            className="border border-gray-200 rounded-xl p-3 bg-white text-gray-900"
            placeholder="Enter your hourly rate"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Languages */}
      <View className="bg-white mt-4 p-4">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Languages</Text>
        
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
                {`${lang.name} (${lang.level})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Specializations */}
      <View className="bg-white mt-4 p-4">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Specializations</Text>
        
        <View className="flex-row flex-wrap">
          {formData.specializations.map((spec) => (
            <TouchableOpacity
              key={spec.id}
              className={`m-1 px-4 py-2 rounded-full border ${
                spec.selected 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
              onPress={() => {
                const newSpecs = formData.specializations.map(s =>
                  s.id === spec.id ? { ...s, selected: !s.selected } : s
                );
                setFormData({ ...formData, specializations: newSpecs });
              }}
            >
              <Text className={`${
                spec.selected ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {spec.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Availability */}
      <View className="bg-white mt-4 p-4">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Availability</Text>
        
        {Object.entries(formData.availability).map(([day, value]) => (
          <View key={day} className="flex-row items-center justify-between py-2">
            <Text className="text-gray-900 capitalize">{day}</Text>
            <Switch
              value={value}
              onValueChange={(newValue) =>
                setFormData({
                  ...formData,
                  availability: {
                    ...formData.availability,
                    [day]: newValue,
                  },
                })
              }
            />
          </View>
        ))}
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
        onPress={() => router.push('/(tabs)/translator')}
      >
        <Text className="text-blue-600 text-center">Skip for now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
