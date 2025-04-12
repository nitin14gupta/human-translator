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

type ErrorScreenProps = {
  title?: string;
  message?: string;
  errorCode?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
};

export default function ErrorScreen({
  title,
  message,
  errorCode,
  onRetry,
  onGoHome,
}: ErrorScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="alert-circle-outline" size={70} color="#FF3B30" />
        </View>

        {/* Error Details */}
        <Text style={styles.title}>
          {title || t('error.title', 'Something went wrong')}
        </Text>
        <Text style={styles.message}>
          {message || t('error.message', "We're having trouble processing your request. Please try again later.")}
        </Text>
        
        {errorCode && (
          <View style={styles.errorCodeContainer}>
            <Text style={styles.errorCodeText}>
              {t('error.code', 'Error code')}: {errorCode}
            </Text>
          </View>
        )}

        {/* Information Box */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>
            {t('error.whatHappened', 'What might have happened?')}
          </Text>
          <View style={styles.infoItem}>
            <Ionicons name="server-outline" size={20} color="#FF3B30" />
            <Text style={styles.infoText}>
              {t('error.serverIssue', 'Our server might be experiencing issues')}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="globe-outline" size={20} color="#FF3B30" />
            <Text style={styles.infoText}>
              {t('error.connectionIssue', 'Your connection might be unstable')}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="timer-outline" size={20} color="#FF3B30" />
            <Text style={styles.infoText}>
              {t('error.timeoutIssue', 'The request might have timed out')}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {onRetry && (
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={onRetry}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>
                {t('error.retry', 'Try Again')}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.homeButton} 
            onPress={handleGoHome}
            activeOpacity={0.7}
          >
            <Ionicons name="home" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>
              {t('error.goHome', 'Go to Home')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t('error.supportInfo', 'If the problem persists, contact our support team.')}
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
  errorCodeContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginBottom: 24,
  },
  errorCodeText: {
    fontSize: 14,
    color: '#666666',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  retryButton: {
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
  homeButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
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