import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Language option type
interface LanguageOption {
  key: string;
  name: string;
  localName: string;
  flag: string;
}

export default function LanguageSelection() {
  const router = useRouter();
  
  // Define available languages
  const languages: LanguageOption[] = [
    { key: 'en', name: 'English', localName: 'English (US)', flag: '🇺🇸' },
    { key: 'es', name: 'Spanish', localName: 'Español', flag: '🇪🇸' },
    { key: 'fr', name: 'French', localName: 'Français', flag: '🇫🇷' },
    { key: 'de', name: 'German', localName: 'Deutsch', flag: '🇩🇪' },
    { key: 'zh', name: 'Chinese', localName: '中文', flag: '🇨🇳' },
    { key: 'ja', name: 'Japanese', localName: '日本語', flag: '🇯🇵' },
  ];
  
  // State to track selected language
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  // Handle language selection
  const selectLanguage = (langKey: string) => {
    setSelectedLanguage(langKey);
  };
  
  // Continue with selected language
  const continueWithLanguage = () => {
    // Here you would save the selected language and navigate
    // For now, just navigate to the next screen
    router.push('/');
  };
  
  // Navigate to get started
  const getStarted = () => {
    router.push('/');
  };
  
  return (
    <SafeAreaView className="flex-1 bg-neutral-white">
      <View className="flex-1 px-5 py-8">
        {/* App Icon */}
        <View className="items-center mb-8 mt-4">
          <View className="w-16 h-16 rounded-2xl items-center justify-center">
            <Image source={require('@/assets/images/languageIcon.png')} className="w-16 h-16" />
          </View>
        </View>
        
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-heading font-bold text-neutral-gray-800 text-center mb-2">
            Choose Your Preferred Language
          </Text>
          <Text className="text-base font-body text-neutral-gray-600 text-center">
            You can change this later in settings.
          </Text>
        </View>
        
        {/* Language Options */}
        <View className="bg-neutral-gray-100 rounded-3xl p-4 mb-8">
          <ScrollView className="flex-grow" showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap">
              {languages.map((lang, index) => (
                <TouchableOpacity 
                  key={lang.key}
                  className={`w-1/2 p-2`}
                  onPress={() => selectLanguage(lang.key)}
                >
                  <View 
                    className={`border rounded-xl p-4 ${
                      selectedLanguage === lang.key 
                        ? 'bg-primary bg-opacity-10 border-primary' 
                        : 'bg-white border-neutral-gray-200'
                    }`}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-2">{lang.flag}</Text>
                      <View className="flex-1">
                        <Text className="font-heading font-medium text-neutral-gray-800">
                          {lang.name}
                        </Text>
                        <Text className="font-body text-sm text-neutral-gray-500">
                          {lang.localName}
                        </Text>
                      </View>
                      {selectedLanguage === lang.key && (
                        <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                          <Ionicons name="checkmark" size={16} color="white" />
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
        
        {/* Buttons */}
        <View className="mt-auto">
          <TouchableOpacity 
            className="bg-primary py-4 rounded-xl items-center mb-3"
            onPress={continueWithLanguage}
          >
            <Text className="text-white font-poppins font-semibold text-base">
              Continue in {languages.find(l => l.key === selectedLanguage)?.name}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="border border-neutral-gray-300 py-4 rounded-xl items-center flex-row justify-center"
            onPress={getStarted}
          >
            <Text className="font-poppins font-medium text-neutral-gray-800 mr-2">
              Get Started
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#343A40" />
          </TouchableOpacity>
        </View>
        
        {/* Bottom Indicator */}
        <View className="items-center mt-6">
          <View className="w-10 h-1 bg-neutral-gray-400 rounded-full" />
        </View>
      </View>
    </SafeAreaView>
  );
}
