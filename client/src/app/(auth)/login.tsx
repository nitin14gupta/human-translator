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
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useErrorHandler } from '../../components/FallbackHandler';

export default function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login, getUserType, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setError } = useErrorHandler();

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle login
  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      Alert.alert(
        t('login.missingFields'),
        t('login.provideEmailPassword'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert(
        t('login.invalidEmail'),
        t('login.enterValidEmail'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    setIsLoading(true);

    try {
      // Call auth context to login
      await login(email, password);
      
      // Get user type to determine navigation
      const userType = await getUserType();
      
      // Navigate based on user role
      if (userType === 'traveler') {
        router.replace("/(tabs)/traveler");
      } else {
        router.replace("/(tabs)/translator");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Show appropriate error message
      Alert.alert(
        t('login.loginFailed'),
        t('login.invalidCredentials'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to registration screen
  const goToRegister = () => {
    router.push("/(auth)/register");
  };

  // Navigate to forgot password screen
  const goToForgotPassword = () => {
    router.push("/(auth)/forgotPassword");
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
            <Text style={styles.title}>{t('login.title')}</Text>
            <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6C757D" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('login.emailPlaceholder')}
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
                placeholder={t('login.passwordPlaceholder')}
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

            {/* Forgot Password Link */}
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={goToForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>
                {t('login.forgotPassword')}
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading || authLoading}
            >
              {isLoading || authLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>
                  {t('login.loginButton')}
                </Text>
              )}
            </TouchableOpacity>

            {/* Registration Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                {t('login.noAccount')}
              </Text>
              <TouchableOpacity onPress={goToRegister}>
                <Text style={styles.registerLink}>
                  {t('login.registerHere')}
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
    marginBottom: 32,
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
    marginBottom: 32,
    textAlign: 'center',
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#0066CC',
    fontSize: 14,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#0066CC',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerText: {
    color: '#6C757D',
    fontSize: 14,
    marginRight: 4,
  },
  registerLink: {
    color: '#0066CC',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 