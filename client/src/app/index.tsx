import React from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const screenHeight = Dimensions.get('window').height;
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-neutral-white">
      <StatusBar barStyle="dark-content" />
      
      <View className="flex-1 relative">
        {/* Main Image */}
        <View className="w-full h-[45%] rounded-2xl overflow-hidden p-12">
          <Image 
            source={require('../../assets/images/welcome-screen-image.png')}
            className="w-full h-full "
            resizeMode="cover"
          />
          
          {/* Language Selection Circles */}
          <View className="absolute top-7 left-7">
            <View className="w-10 h-10 bg-neutral-white rounded-full items-center justify-center shadow-md">
              <Text className="font-montserrat font-semibold text-primary">EN</Text>
            </View>
          </View>
          
          <View className="absolute bottom-10 left-20">
            <View className="w-10 h-10 bg-neutral-white rounded-full items-center justify-center shadow-md">
              <Text className="font-montserrat font-semibold text-primary">FR</Text>
            </View>
          </View>
          
          <View className="absolute top-20 right-7">
            <View className="w-10 h-10 bg-neutral-white rounded-full items-center justify-center shadow-md">
              <Text className="font-montserrat font-semibold text-primary">ES</Text>
            </View>
          </View>
        </View>
        
        {/* Content Area */}
        <View className="flex-1 px-8 pt-10 pb-6 justify-between">
          {/* Heading and Subtext */}
          <View>
            <Text className="text-4xl font-heading font-bold text-primary text-center mb-4">
              Break Language Barriers, Connect with Confidence
            </Text>
            
            <Text className="text-base font-body text-neutral-gray-600 text-center text-xl">
              Book a local translator or offer your skills to travelers worldwide.
            </Text>
          </View>
          
          {/* Get Started Button */}
          <View className="mb-5">
            <TouchableOpacity 
            className="bg-primary py-4 rounded-xl flex-row items-center justify-center"
            onPress={() => router.push('/(shared)/languageSelection')}
            >
              <Text className="text-white font-poppins font-semibold text-base mr-2">Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          {/* Bottom Indicator */}
          <View className="items-center">
            <View className="w-10 h-1 bg-neutral-gray-400 rounded-full" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
