import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type SessionExpiredScreenProps = {
  onLogin?: () => void;
};

export default function SessionExpiredScreen({ onLogin }: SessionExpiredScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Session Expired Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="time-outline" size={70} color="#FF3B30" />
        </View>

        {/* Message */}
        <Text style={styles.title}>{t('session.expired')}</Text>
        <Text style={styles.message}>{t('session.message')}</Text>

        {/* Security Notice */}
        <View style={styles.noticeContainer}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#FF3B30" />
          <Text style={styles.noticeText}>
            {t('session.securityMessage')}
          </Text>
        </View>

        {/* Login Instruction */}
        <Text style={styles.instruction}>
          {t('session.loginAgain')}
        </Text>

        {/* Login Button */}
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          activeOpacity={0.7}
        >
          <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>{t('session.loginButton')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  noticeContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
    alignItems: 'center',
    width: '100%',
  },
  noticeText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  instruction: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'center',
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 280,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 