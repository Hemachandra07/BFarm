import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export const BookingConfirmationScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { request, isOfflineSaved } = route.params || {};

  const refNumber = request?.referenceNumber || 'AC-2026-00124';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>

        <Text style={styles.title}>{t('requestSubmitted')}</Text>
        <Text style={styles.subtitle}>{t('infoSaved')}</Text>

        {isOfflineSaved && (
          <View style={styles.offlineNotice}>
            <Text style={styles.offlineNoticeText}>
              📱 Saved offline. Will automatically synchronize with the central dispatch server as soon as internet is detected.
            </Text>
          </View>
        )}

        <View style={styles.refBox}>
          <Text style={styles.refLabel}>{t('referenceNumber')}</Text>
          <Text style={styles.refCode}>{refNumber}</Text>
        </View>

        <View style={styles.detailsList}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Produce:</Text>
            <Text style={styles.detailVal}>{request?.crop || 'Tomato'} ({request?.quantity || 500} kg)</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Destination:</Text>
            <Text style={styles.detailVal} numberOfLines={1}>{request?.destination || 'Cold Storage Hub'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estimated Fare:</Text>
            <Text style={styles.detailVal}>₹{request?.estimatedCost || 1200}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[styles.detailVal, styles.statusPending]}>PENDING DISPATCH</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.doneBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('HomeTab')}
        >
          <Text style={styles.doneBtnText}>🏠 {t('done')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#86efac',
  },
  checkIcon: {
    fontSize: 40,
    fontWeight: '900',
    color: '#15803d',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
  },
  offlineNotice: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    padding: 12,
    marginVertical: 14,
  },
  offlineNoticeText: {
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
  },
  refBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#bbf7d0',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 16,
    width: '100%',
  },
  refLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  refCode: {
    fontSize: 26,
    fontWeight: '900',
    color: '#15803d',
    letterSpacing: 1,
    marginTop: 4,
  },
  detailsList: {
    width: '100%',
    gap: 10,
    marginTop: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
  },
  statusPending: {
    color: '#d97706',
  },
  footer: {
    paddingBottom: 20,
  },
  doneBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
});
