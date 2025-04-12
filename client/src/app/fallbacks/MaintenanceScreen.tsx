import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Linking,
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

  const handleStatusCheck = () => {
    // Replace with your status page URL
    Linking.openURL('https://status.humantranslator.app');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Maintenance Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="construct-outline" size={70} color="#FF9500" />
        </View>

        {/* Main Content */}
        <Text style={styles.title}>{t('maintenance.title')}</Text>
        <Text style={styles.message}>{t('maintenance.message')}</Text>

        {/* Estimated Time */}
        {estimatedTime && (
          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>
              {t('maintenance.scheduledTime')}
            </Text>
            <Text style={styles.timeValue}>
              {t('maintenance.estimatedTime', { time: estimatedTime })}
            </Text>
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="build-outline" size={24} color="#FF9500" />
            <Text style={styles.infoText}>
              {t('maintenance.upgradeInfo')}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <Ionicons name="heart-outline" size={24} color="#FF9500" />
            <Text style={styles.infoText}>
              {t('maintenance.apologyMessage')}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.statusButton}
            onPress={handleStatusCheck}
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>
              {t('maintenance.checkStatus')}
            </Text>
          </TouchableOpacity>

          {onRefresh && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={onRefresh}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={20} color="#FF9500" style={styles.buttonIcon} />
              <Text style={styles.retryButtonText}>
                {t('maintenance.tryAgain')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
    marginBottom: 32,
    backgroundColor: '#FFF9F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
  },
  timeLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    marginRight: 6,
  },
  timeValue: {
    fontSize: 16,
    color: '#FF9500',
    fontWeight: '600',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 16,
    flex: 1,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  statusButton: {
    flexDirection: 'row',
    backgroundColor: '#FF9500',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButtonText: {
    color: '#FF9500',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 