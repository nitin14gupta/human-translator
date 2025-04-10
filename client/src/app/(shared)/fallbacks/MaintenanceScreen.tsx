import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

type MaintenanceScreenProps = {
  estimatedTime?: string;
  onRefresh?: () => void;
};

export default function MaintenanceScreen({
  estimatedTime,
  onRefresh,
}: MaintenanceScreenProps) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Maintenance Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="construct" size={70} color="#FF9500" />
        </View>

        {/* Maintenance Info */}
        <Text style={styles.title}>{t('maintenance.title', 'System Maintenance')}</Text>
        <Text style={styles.message}>
          {t(
            'maintenance.message',
            'Our app is currently undergoing scheduled maintenance to improve your experience. We\'ll be back soon!'
          )}
        </Text>

        {/* Estimated Time */}
        {estimatedTime && (
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={20} color="#666666" style={styles.timeIcon} />
            <Text style={styles.timeText}>
              {t('maintenance.estimatedTime', 'Estimated completion')}: {estimatedTime}
            </Text>
          </View>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>
              {t('maintenance.checkAgain', 'Check Again')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Explanation Section */}
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>
            {t('maintenance.whatHappening', 'What\'s Happening?')}
          </Text>
          <Text style={styles.explanationText}>
            {t(
              'maintenance.explanation',
              'We\'re updating our systems to bring you new features and improve performance. This maintenance helps us provide a better service for you.'
            )}
          </Text>

          <View style={styles.bulletPoints}>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>
                {t('maintenance.bulletOne', 'Improving app performance')}
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>
                {t('maintenance.bulletTwo', 'Adding new features')}
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>
                {t('maintenance.bulletThree', 'Enhancing security')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t('maintenance.apologies', 'We apologize for any inconvenience')}
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
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
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
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 32,
  },
  timeIcon: {
    marginRight: 8,
  },
  timeText: {
    fontSize: 15,
    color: '#333333',
    fontWeight: '500',
  },
  refreshButton: {
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
  explanationContainer: {
    width: '100%',
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 12,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  bulletPoints: {
    width: '100%',
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9500',
    marginRight: 10,
  },
  bulletText: {
    fontSize: 14,
    color: '#333333',
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