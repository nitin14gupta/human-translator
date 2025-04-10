import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, SafeAreaView, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type UserRole = "traveler" | "translator" | null;

export default function RoleSelection() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle role selection
  const selectRole = (role: UserRole) => {
    setSelectedRole(role);
  };

  // Continue with selected role
  const continueWithRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      // Navigate to authentication with role parameter
      if (role === "traveler") {
        router.push({
          pathname: "/(shared)/Authentication",
          params: { isNeedTranslator: "true" }
        });
      } else {
        router.push({
          pathname: "/(shared)/Authentication",
          params: { isNeedTranslator: "false" }
        });
      }
    } catch (error) {
      console.error("Error saving role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to language selection
  const openLanguageSelector = () => {
    router.push("/(shared)/languageSelection");
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
      <View className="flex-1 px-5 items-center justify-between">
        {/* Main Content */}
        <View className="flex-1 items-center justify-center w-full max-w-md">
          {/* App Logo */}
          <View className="mb-8">
            <View className="w-20 h-20 rounded-full bg-primary items-center justify-center">
              <Text className="text-white font-heading font-bold text-xl">
                XA
              </Text>
            </View>
          </View>

          {/* Header Text */}
          <Text className="text-3xl font-heading font-bold text-neutral-gray-800 text-center mb-2">
            {t("roleSelection.title")}
          </Text>
          <Text className="text-base font-body text-neutral-gray-600 text-center mb-8">
            {t("roleSelection.subtitle")}
          </Text>

          {/* Role Selection Buttons */}
          <View className="w-full space-y-4 mb-8">
            <TouchableOpacity
              className="bg-primary py-4 rounded-xl items-center"
              onPress={() => continueWithRole("traveler")}
            >
              <Text className="text-white font-semibold text-base">
                {t("roleSelection.needTranslator")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-primary bg-white py-4 rounded-xl items-center"
              onPress={() => continueWithRole("translator")}
            >
              <Text className="text-primary font-semibold text-base">
                {t("roleSelection.offerTranslation")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Language Selector (Bottom) */}
        <TouchableOpacity
          className="flex-row items-center py-4 mb-6"
          onPress={openLanguageSelector}
        >
          <Ionicons name="language-outline" size={24} color="#6C757D" />
          <Text className="mx-2 text-neutral-gray-600">
            {t(`languages.${i18n.language}`)}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#6C757D" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
