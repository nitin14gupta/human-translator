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
        {/* No Internet Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="wifi-outline" size={70} color="#007AFF" />
        </View>

        {/* Main Content */}
        <Text style={styles.title}>
          {t('noInternet.title', 'No Internet Connection')}
        </Text>
        <Text style={styles.message}>
          {t(
            'noInternet.message',
            'It looks like you\'re offline. Please check your connection and try again.'
          )}
        </Text>

        {/* Troubleshooting Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>
            {t('noInternet.tipsTitle', 'Try these tips:')}
          </Text>
          <View style={styles.tipItem}>
            <Ionicons name="refresh-outline" size={20} color="#007AFF" />
            <Text style={styles.tipText}>
              {t('noInternet.tip1', 'Check your Wi-Fi or cellular data connection')}
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="airplane-outline" size={20} color="#007AFF" />
            <Text style={styles.tipText}>
              {t('noInternet.tip2', 'Make sure airplane mode is off')}
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="move-outline" size={20} color="#007AFF" />
            <Text style={styles.tipText}>
              {t('noInternet.tip3', 'Move to an area with better reception')}
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="power-outline" size={20} color="#007AFF" />
            <Text style={styles.tipText}>
              {t('noInternet.tip4', 'Restart your device')}
            </Text>
          </View>
        </View>

        {/* Retry Button */}
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>
            {t('noInternet.retryButton', 'Try Again')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t('noInternet.offlineInfo', 'Some features may be available offline.')}
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
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
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
    marginBottom: 32,
    lineHeight: 24,
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: '#F5F7FA',
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