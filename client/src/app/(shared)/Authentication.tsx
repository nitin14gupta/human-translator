import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { sendVerificationCode } from "../../services/api";

export default function Authentication() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isNeedTranslator = params.isNeedTranslator === "true";
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+1");
  const [isLoading, setIsLoading] = useState(false);
  const [showCountryCodeSelector, setShowCountryCodeSelector] = useState(false);

  // Handle sign up
  const handleSignUp = async () => {
    if (!phoneNumber || phoneNumber.length < 7) {
      Alert.alert("Invalid Phone Number", "Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      // Call the API to send verification code
      const fullPhoneNumber = `${selectedCountryCode}${phoneNumber}`;
      await sendVerificationCode(fullPhoneNumber);
      
      // Navigate to verification screen
      router.push({
        pathname: "/(shared)/Verification",
        params: {
          phoneNumber: fullPhoneNumber,
          isNeedTranslator: isNeedTranslator.toString(),
        },
      });
    } catch (error) {
      console.error("Error signing up:", error);
      Alert.alert("Error", "Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle continue with Google
  const handleGoogleSignIn = () => {
    Alert.alert(
      "Not Implemented",
      "Google Sign-In is not implemented in this demo."
    );
  };

  // Handle continue with Apple
  const handleAppleSignIn = () => {
    Alert.alert(
      "Not Implemented",
      "Apple Sign-In is not implemented in this demo."
    );
  };

  // Handle terms and privacy links
  const handleTermsPress = () => {
    // Navigate to terms page
  };

  const handlePrivacyPress = () => {
    // Navigate to privacy policy page
  };

  // If loading, show a loading indicator
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#007BFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 items-center">
            {/* App Logo */}
            <View className="mt-8 mb-4">
              <View className="w-16 h-16 rounded-xl items-center justify-center">
                <Image source={require("@/assets/images/languageIcon.png")} className="w-12 h-12" />
              </View>
            </View>

            {/* App Name */}
            <Text className="text-primary text-2xl font-heading font-semibold mb-6">
              {t("authentication.appName")}
            </Text>

            {/* Header */}
            <View className="w-full mb-8">
              <Text className="text-2xl font-heading font-bold text-neutral-gray-800 text-center mb-2">
                {t("authentication.title")}
              </Text>
              <Text className="text-base font-body text-neutral-gray-600 text-center">
                {t("authentication.subtitle")}
              </Text>
            </View>

            {/* Phone Number Input */}
            <View className="w-full mb-4">
              <View className="flex-row items-center border border-neutral-gray-300 rounded-lg overflow-hidden">
                <TouchableOpacity
                  className="px-2 py-3 flex-row items-center"
                  onPress={() => setShowCountryCodeSelector(true)}
                >
                  <Text className="text-neutral-gray-700 mr-1">{selectedCountryCode}</Text>
                  <Ionicons name="chevron-down" size={16} color="#6C757D" />
                </TouchableOpacity>
                <TextInput
                  className="flex-1 py-3 px-2 text-neutral-gray-800"
                  placeholder={t("authentication.phoneNumberPlaceholder")}
                  placeholderTextColor="#ADB5BD"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>

            {/* Privacy Notice */}
            <View className="w-full bg-blue-50 rounded-lg p-4 flex-row items-center mb-8">
              <Ionicons name="shield-checkmark" size={20} color="#007BFF" />
              <Text className="text-sm text-neutral-gray-700 ml-2">
                {t("authentication.privacyNotice")}
              </Text>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              className="w-full bg-primary py-4 rounded-lg items-center mb-4"
              onPress={handleSignUp}
            >
              <Text className="text-white font-semibold text-base">
                {t("authentication.signUpButton")}
              </Text>
            </TouchableOpacity>

            {/* Or Continue With */}
            <View className="w-full flex-row items-center my-4">
              <View className="flex-1 h-0.5 bg-neutral-gray-200" />
              <Text className="mx-4 text-neutral-gray-500">
                {t("authentication.orContinueWith")}
              </Text>
              <View className="flex-1 h-0.5 bg-neutral-gray-200" />
            </View>

            {/* Social Sign In Buttons */}
            <View className="w-full space-y-3 mb-6">
              <TouchableOpacity
                className="w-full border border-neutral-gray-300 py-4 rounded-lg items-center flex-row justify-center"
                onPress={handleGoogleSignIn}
              >
                <Ionicons name="logo-google" size={20} color="#4285F4" />
                <Text className="ml-2 text-neutral-gray-800 font-medium">
                  {t("authentication.continueWithGoogle")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="w-full border border-neutral-gray-300 py-4 rounded-lg items-center flex-row justify-center"
                onPress={handleAppleSignIn}
              >
                <Ionicons name="logo-apple" size={20} color="#000" />
                <Text className="ml-2 text-neutral-gray-800 font-medium">
                  {t("authentication.continueWithApple")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms and Privacy */}
            <Text className="text-center text-neutral-gray-600 text-sm mb-6">
              {t("authentication.termsPrefix")}{" "}
              <Text
                className="text-primary"
                onPress={handleTermsPress}
              >
                {t("authentication.terms")}
              </Text>{" "}
              {t("authentication.andConnector")}{" "}
              <Text
                className="text-primary"
                onPress={handlePrivacyPress}
              >
                {t("authentication.privacyPolicy")}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
