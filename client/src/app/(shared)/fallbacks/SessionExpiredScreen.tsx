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
      // Default navigation to login screen
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

        {/* Main Content */}
        <Text style={styles.title}>
          {t('session.expired.title', 'Session Expired')}
        </Text>
        <Text style={styles.message}>
          {t(
            'session.expired.message',
            'Your session has expired for security reasons. Please log in again to continue using the app.'
          )}
        </Text>

        {/* Information Section */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>
            {t('session.expired.whyTitle', 'Why did this happen?')}
          </Text>
          <Text style={styles.infoText}>
            {t(
              'session.expired.whyMessage',
              'Sessions expire automatically after a period of inactivity to protect your account security.'
            )}
          </Text>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>
            {t('session.expired.loginButton', 'Log In Again')}
          </Text>
        </TouchableOpacity>

        {/* Help Section */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>
            {t('session.expired.needHelp', 'Need help?')}
          </Text>
          <View style={styles.helpItems}>
            <TouchableOpacity style={styles.helpItem}>
              <Ionicons name="help-circle-outline" size={18} color="#4F6BFF" />
              <Text style={styles.helpItemText}>
                {t('session.expired.faq', 'FAQ')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.helpItem}>
              <Ionicons name="mail-outline" size={18} color="#4F6BFF" />
              <Text style={styles.helpItemText}>
                {t('session.expired.support', 'Contact Support')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t('session.expired.noDataLost', 'Don\'t worry, your data is safe and secure.')}
        </Text>
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
  infoBox: {
    width: '100%',
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: '#4F6BFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
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
  helpContainer: {
    width: '100%',
    alignItems: 'center',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  helpItems: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  helpItemText: {
    fontSize: 14,
    color: '#4F6BFF',
    fontWeight: '500',
    marginLeft: 6,
  },
  footer: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  footerText: {
    fontSize: 14,
    color: '#999999',
  },
}); 