import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <ScrollView className="flex-1 bg-neutral-white">
      {/* Hero Section */}
      <View className="bg-primary p-8 items-center">
        <Text className="text-4xl font-heading text-white text-center mt-12 mb-2">
          Translator Connect
        </Text>
        <Text className="text-lg font-body text-white text-center mb-8">
          Bridge language barriers with human translators
        </Text>
        <TouchableOpacity className="bg-secondary px-6 py-3 rounded-full">
          <Text className="text-white font-medium text-base">Get Started</Text>
        </TouchableOpacity>
      </View>

      {/* Color Palette Demo */}
      <View className="p-6">
        <Text className="text-2xl font-heading text-neutral-gray-800 mb-4">
          Color Palette
        </Text>
        
        <View className="flex-row flex-wrap gap-2 mb-6">
          <View className="h-20 w-20 bg-primary rounded-md items-center justify-center">
            <Text className="text-white text-xs">Primary</Text>
          </View>
          <View className="h-20 w-20 bg-primary-green rounded-md items-center justify-center">
            <Text className="text-white text-xs">Primary Green</Text>
          </View>
          <View className="h-20 w-20 bg-secondary rounded-md items-center justify-center">
            <Text className="text-white text-xs">Secondary</Text>
          </View>
          <View className="h-20 w-20 bg-secondary-lilac rounded-md items-center justify-center">
            <Text className="text-white text-xs">Secondary Lilac</Text>
          </View>
          <View className="h-20 w-20 bg-accent-yellow rounded-md items-center justify-center">
            <Text className="text-white text-xs">Accent Yellow</Text>
          </View>
          <View className="h-20 w-20 bg-accent-teal rounded-md items-center justify-center">
            <Text className="text-white text-xs">Accent Teal</Text>
          </View>
        </View>
      </View>

      {/* Typography Demo */}
      <View className="p-6 border-t border-neutral-gray-200">
        <Text className="text-2xl font-heading text-neutral-gray-800 mb-4">
          Typography
        </Text>
        
        <View className="mb-6">
          <Text className="font-roboto text-lg mb-2">Roboto - Primary UI Font</Text>
          <Text className="font-open-sans text-lg mb-2">Open Sans - Body Text</Text>
          <Text className="font-montserrat text-lg mb-2">Montserrat - Headings</Text>
          <Text className="font-poppins text-lg mb-2">Poppins - Buttons & Labels</Text>
          <Text className="font-noto text-lg mb-2">Noto Sans - Multilingual Support</Text>
        </View>
      </View>

      {/* Components Demo */}
      <View className="p-6 border-t border-neutral-gray-200 mb-8">
        <Text className="text-2xl font-heading text-neutral-gray-800 mb-4">
          UI Components
        </Text>
        
        <View className="gap-4">
          <TouchableOpacity className="btn-primary mb-2">
            <Text className="text-white font-medium text-center">Primary Button</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="btn-secondary mb-2">
            <Text className="text-white font-medium text-center">Secondary Button</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="btn-outline mb-2">
            <Text className="text-center">Outline Button</Text>
          </TouchableOpacity>
          
          <View className="card mb-2">
            <Text className="font-heading text-lg mb-1">Card Component</Text>
            <Text className="font-body text-neutral-gray-600">This is a standard card component.</Text>
          </View>
          
          <View className="translator-card">
            <Text className="font-heading text-lg mb-1">Translator Profile</Text>
            <Text className="font-body text-neutral-gray-600">This is a specialized card for translator profiles.</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
