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

type NoInternetScreenProps = {
  onRetry?: () => void;
};

export default function NoInternetScreen({ onRetry }: NoInternetScreenProps) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="wifi-outline" size={70} color="#8E8E93" />
        </View>

        {/* Main Text */}
        <Text style={styles.title}>{t('noInternet.title')}</Text>
        <Text style={styles.message}>{t('noInternet.message')}</Text>

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>{t('noInternet.tips')}</Text>
          
          <View style={styles.tipItem}>
            <Ionicons name="wifi" size={20} color="#8E8E93" />
            <Text style={styles.tipText}>{t('noInternet.checkWifi')}</Text>
          </View>
          
          <View style={styles.tipItem}>
            <Ionicons name="cellular" size={20} color="#8E8E93" />
            <Text style={styles.tipText}>{t('noInternet.checkData')}</Text>
          </View>
          
          <View style={styles.tipItem}>
            <Ionicons name="refresh-circle" size={20} color="#8E8E93" />
            <Text style={styles.tipText}>{t('noInternet.restartDevice')}</Text>
          </View>
        </View>
        
        {/* Retry Button */}
        {onRetry && (
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={onRetry}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>{t('noInternet.retry')}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t('noInternet.offlineNotice')}
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
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: '#F9F9FB',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  tipText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
    flex: 1,
  },
  retryButton: {
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