import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { verifyCode, sendVerificationCode } from "../../services/api";

export default function Verification() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;
  const isNeedTranslator = params.isNeedTranslator === "true";
  
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  // Refs for input fields
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Set up timer for resend code
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Handle code input
  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      // If pasting multiple digits
      const digits = text.split("").slice(0, 6);
      const newCode = [...code];
      
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      
      setCode(newCode);
      
      // Focus on the next empty input or the last input
      const nextEmptyIndex = newCode.findIndex((digit) => digit === "");
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    } else {
      // Single digit input
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);
      
      // Auto advance to next input
      if (text !== "" && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // If backspace and current input is empty, focus previous input
    if (e.nativeEvent.key === "Backspace" && code[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle verify button press
  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      Alert.alert("Invalid Code", "Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      // Call the API to verify the code
      const response = await verifyCode(
        phoneNumber,
        fullCode,
        isNeedTranslator,
        t("languages.en") // Use current language
      );
      
      // Show success alert and navigate to home
      Alert.alert(
        "Success", 
        `Verification successful! You've been registered as a ${isNeedTranslator ? "traveler" : "translator"}.`,
        [
          {
            text: "OK",
            onPress: () => router.push("/(tabs)")
          }
        ]
      );
    } catch (error) {
      console.error("Error verifying code:", error);
      Alert.alert("Error", "Failed to verify code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    try {
      // Call the API to resend the code
      await sendVerificationCode(phoneNumber);
      
      // Reset timer and code
      setTimer(30);
      setCanResend(false);
      setCode(["", "", "", "", "", ""]);
      
      // Focus on first input
      inputRefs.current[0]?.focus();
      
      Alert.alert("Code Resent", "A new verification code has been sent.");
    } catch (error) {
      console.error("Error resending code:", error);
      Alert.alert("Error", "Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
        <View className="flex-1 px-6 items-center">
          {/* App Logo */}
          <View className="mt-8 mb-4">
            <View className="w-16 h-16 rounded-xl bg-primary items-center justify-center">
              <Text className="text-white font-heading font-bold text-xl">
                XA
              </Text>
            </View>
          </View>

          {/* Header */}
          <View className="w-full mb-8">
            <Text className="text-2xl font-heading font-bold text-neutral-gray-800 text-center mb-2">
              {t("verification.title")}
            </Text>
            <Text className="text-base font-body text-neutral-gray-600 text-center">
              {t("verification.subtitle", { phoneNumber })}
            </Text>
          </View>

          {/* Verification Code Inputs */}
          <View className="flex-row justify-between w-full mb-8">
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                className="w-12 h-14 border border-neutral-gray-300 rounded-lg text-center text-xl font-bold text-neutral-gray-800"
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                style={[
                  digit ? styles.filledInput : {},
                  index === 0 && digit ? styles.firstFilledInput : {},
                ]}
              />
            ))}
          </View>

          {/* Resend Code */}
          <TouchableOpacity
            onPress={handleResendCode}
            disabled={!canResend}
            className="mb-8"
          >
            <Text
              className={`text-center ${
                canResend ? "text-primary" : "text-neutral-gray-500"
              }`}
            >
              {t("verification.resendCode", { timer: canResend ? "0:00" : `0:${timer.toString().padStart(2, "0")}` })}
            </Text>
          </TouchableOpacity>

          {/* Verify Button */}
          <TouchableOpacity
            className="w-full bg-primary py-4 rounded-lg items-center mb-4"
            onPress={handleVerify}
          >
            <Text className="text-white font-semibold text-base">
              {t("verification.verifyButton")}
            </Text>
          </TouchableOpacity>

          {/* Security Notice */}
          <View className="flex-row items-center justify-center mt-4">
            <Ionicons name="lock-closed" size={16} color="#6C757D" />
            <Text className="text-neutral-gray-600 text-sm ml-2">
              {t("verification.secureNotice")}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filledInput: {
    borderColor: "#007BFF",
    backgroundColor: "#F8F9FA",
  },
  firstFilledInput: {
    backgroundColor: "#007BFF",
    color: "#FFFFFF",
    borderColor: "#007BFF",
  },
});
