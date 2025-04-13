import React, { useState, useEffect } from "react";
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
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useErrorHandler } from '../../components/FallbackHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Register() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isNeedTranslator = params.isNeedTranslator === "true";
  const { register, isLoading: authLoading } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState(i18n.language || 'en');
  const { setError } = useErrorHandler();

  // Load saved language on component mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('userLanguage');
        if (savedLanguage) {
          setPreferredLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };
    
    loadLanguage();
  }, []);

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const isValidPassword = (password: string): boolean => {
    // Require at least 8 characters with at least one uppercase, one lowercase, and one number
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    return password.length >= 8 && hasUpperCase && hasLowerCase && hasNumber;
  };

  // Handle registration
  const handleRegister = async () => {
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert(
        t('register.missingFields'),
        t('register.fillAllFields'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert(
        t('register.invalidEmail'),
        t('register.enterValidEmail'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    if (!isValidPassword(password)) {
      Alert.alert(
        t('register.invalidPassword'),
        t('register.passwordRequirements'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        t('register.passwordMismatch'),
        t('register.passwordsDoNotMatch'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    setIsLoading(true);

    try {
      // Call auth context to register
      await register({
        name,
        email,
        password,
        confirm_password: confirmPassword,
        is_traveler: isNeedTranslator,
        preferred_language: preferredLanguage,
      });
      
      // Navigate to success or additional info screen
      if (isNeedTranslator) {
        router.push("/(shared)/travelerInfo");
      } else {
        router.push("/(shared)/translatorInfo");
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      // Show appropriate error message
      const errorMsg = error instanceof Error ? error.message : t('register.registrationFailed');
      
      Alert.alert(
        t('register.registrationFailed'),
        errorMsg.includes('Email already registered') 
          ? t('register.emailAlreadyExists')
          : errorMsg,
        [{ text: t('common.ok') }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to login screen
  const goToLogin = () => {
    router.push("/login");
  };

  // Navigate to terms screen
  const goToTerms = () => {
    router.push("/(shared)/terms");
  };

  // Navigate to privacy policy screen
  const goToPrivacyPolicy = () => {
    router.push("/(shared)/privacyPolicy");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            {/* App Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>HT</Text>
              </View>
            </View>

            {/* Header Text */}
            <Text style={styles.title}>{t('register.title')}</Text>
            <Text style={styles.subtitle}>{t('register.subtitle')}</Text>

            {/* Role Text */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleText}>
                {isNeedTranslator 
                  ? t('register.traveler') 
                  : t('register.translator')}
              </Text>
            </View>

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#6C757D" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('register.namePlaceholder')}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#6C757D"
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6C757D" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('register.emailPlaceholder')}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#6C757D"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6C757D" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('register.passwordPlaceholder')}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#6C757D"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#6C757D"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6C757D" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('register.confirmPasswordPlaceholder')}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#6C757D"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#6C757D"
                />
              </TouchableOpacity>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={isLoading || authLoading}
            >
              {isLoading || authLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.registerButtonText}>
                  {t('register.registerButton')}
                </Text>
              )}
            </TouchableOpacity>

            {/* Terms and Privacy */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                {t('register.termsPrefix')}
              </Text>
              <TouchableOpacity onPress={goToTerms}>
                <Text style={styles.termsLink}>
                  {t('register.terms')}
                </Text>
              </TouchableOpacity>
              <Text style={styles.termsText}>
                {t('register.andConnector')}
              </Text>
              <TouchableOpacity onPress={goToPrivacyPolicy}>
                <Text style={styles.termsLink}>
                  {t('register.privacyPolicy')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                {t('register.haveAccount')}
              </Text>
              <TouchableOpacity onPress={goToLogin}>
                <Text style={styles.loginLink}>
                  {t('register.logIn')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 16,
    textAlign: 'center',
  },
  roleContainer: {
    backgroundColor: '#E6F2FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 24,
  },
  roleText: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
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
  passwordToggle: {
    padding: 8,
  },
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 24,
  },
  termsText: {
    color: '#6C757D',
    fontSize: 14,
    marginRight: 4,
  },
  termsLink: {
    color: '#0066CC',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  registerButton: {
    width: '100%',
    backgroundColor: '#0066CC',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginText: {
    color: '#6C757D',
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    color: '#0066CC',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 