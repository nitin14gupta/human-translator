import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { changeLanguage, getLanguage } from "../../services/languageService";

// Language option type
interface LanguageOption {
  key: string;
  name: string;
  localName: string;
  flag: string;
}

export default function LanguageSelection() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Define available languages
  const languages: LanguageOption[] = [
    { key: 'en', name: t('languages.en'), localName: 'English (US)', flag: '🇺🇸' },
    { key: 'es', name: t('languages.es'), localName: 'Español', flag: '🇪🇸' },
    { key: 'fr', name: t('languages.fr'), localName: 'Français', flag: '🇫🇷' },
    { key: 'de', name: t('languages.de'), localName: 'Deutsch', flag: '🇩🇪' },
    { key: 'zh', name: t('languages.zh'), localName: '中文', flag: '🇨🇳' },
    { key: 'ja', name: t('languages.ja'), localName: '日本語', flag: '🇯🇵' },
  ];
  
  // State to track selected language
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');
  
  // Load the current language on component mount
  useEffect(() => {
    const loadLanguage = async () => {
      setIsLoading(true);
      try {
        const currentLang = await getLanguage();
        setSelectedLanguage(currentLang);
      } catch (error) {
        console.error("Error loading language:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLanguage();
  }, []);
  
  // Handle language selection
  const selectLanguage = async (langKey: string) => {
    setIsLoading(true);
    setSelectedLanguage(langKey);
    
    try {
      await changeLanguage(langKey);
    } catch (error) {
      console.error("Error changing language:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Continue with selected language
  const continueWithLanguage = async () => {
    setIsLoading(true);
    
    try {
      // Save the selected language and update both locally and on server
      await changeLanguage(selectedLanguage);
      
      // Navigate to the next screen
      router.push('/roleSelection');
    } catch (error) {
      console.error("Error saving language preference:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // If loading, show a loading indicator
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-white items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 font-body text-neutral-gray-600">
          {t('languageSelection.loading')}
        </Text>
      </SafeAreaView>
    );
  }
  
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
            {t('languageSelection.title')}
          </Text>
          <Text className="text-base font-body text-neutral-gray-600 text-center">
            {t('languageSelection.subtitle')}
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
        <View className="mt-auto mb-8">
          <TouchableOpacity 
            className="bg-primary py-4 rounded-xl items-center mb-3"
            onPress={continueWithLanguage}
            disabled={isLoading}
          >
            <Text className="text-white font-poppins font-semibold text-base">
              {t('languageSelection.continueButton', { 
                language: languages.find(l => l.key === selectedLanguage)?.name 
              })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
