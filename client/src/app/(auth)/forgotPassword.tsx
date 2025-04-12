import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle password reset request
  const handleResetRequest = async () => {
    // Validate email
    if (!email || !isValidEmail(email)) {
      Alert.alert(
        t('forgotPassword.invalidEmail'),
        t('forgotPassword.enterValidEmail'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    setIsLoading(true);

    try {
      // Call context function to request password reset
      await resetPassword(email);
      
      // Show success message
      setResetSent(true);
    } catch (error) {
      console.error("Password reset error:", error);
      
      // Show error message
      Alert.alert(
        t('forgotPassword.resetFailed'),
        t('forgotPassword.tryAgainLater'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to login
  const goToLogin = () => {
    router.push("/(shared)/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={goToLogin}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>

          {/* Header */}
          <Text style={styles.title}>{t('forgotPassword.title')}</Text>
          <Text style={styles.subtitle}>{t('forgotPassword.subtitle')}</Text>

          {resetSent ? (
            // Success View
            <View style={styles.successContainer}>
              <Ionicons name="mail" size={60} color="#0066CC" style={styles.successIcon} />
              <Text style={styles.successTitle}>{t('forgotPassword.checkEmail')}</Text>
              <Text style={styles.successMessage}>{t('forgotPassword.resetLinkSent')}</Text>
              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={goToLogin}
              >
                <Text style={styles.backToLoginText}>{t('forgotPassword.backToLogin')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Reset Request Form
            <>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#6C757D" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('forgotPassword.emailPlaceholder')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#6C757D"
                />
              </View>
              
              {/* Submit Button */}
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetRequest}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.resetButtonText}>
                    {t('forgotPassword.resetButton')}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 80,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 40,
    textAlign: 'center',
    maxWidth: '80%',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
    height: 50,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#212529',
  },
  resetButton: {
    width: '100%',
    backgroundColor: '#0066CC',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 30,
  },
  backToLoginButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#0066CC',
  },
  backToLoginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 