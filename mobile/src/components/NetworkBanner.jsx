import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getPendingRequests } from '../storage/offlineQueue';
import { syncOfflineDataWithServer } from '../services/syncService';

export const NetworkBanner = ({ forceOffline = false, onSyncComplete }) => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncMessage, setSyncMessage] = useState(null);

  const checkStatus = async () => {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      setIsOnline(navigator.onLine && !forceOffline);
    } else {
      setIsOnline(!forceOffline);
    }

    const pending = await getPendingRequests();
    setPendingCount(pending.length);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [forceOffline]);

  const handleManualSync = async () => {
    setSyncMessage('Syncing...');
    const res = await syncOfflineDataWithServer(1);
    setSyncMessage(res.message);
    const pending = await getPendingRequests();
    setPendingCount(pending.length);
    if (onSyncComplete) onSyncComplete();
    setTimeout(() => setSyncMessage(null), 4000);
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, isOnline ? styles.onlineBg : styles.offlineBg]}>
        <View style={styles.statusRow}>
          <View style={[styles.indicator, isOnline ? styles.onlineDot : styles.offlineDot]} />
          <Text style={[styles.statusText, isOnline ? styles.onlineText : styles.offlineText]}>
            {isOnline ? `🟢 ${t('online')}` : `🔴 ${t('offline')}`}
          </Text>
        </View>

        {pendingCount > 0 && (
          <TouchableOpacity style={styles.syncBtn} onPress={handleManualSync}>
            <Text style={styles.syncBtnText}>
              {t('syncPending', { count: pendingCount })} • {t('syncNow')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {syncMessage && (
        <View style={styles.syncToast}>
          <Text style={styles.syncToastText}>{syncMessage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  onlineBg: {
    backgroundColor: '#f0fdf4',
    borderBottomColor: '#dcfce7',
  },
  offlineBg: {
    backgroundColor: '#fef2f2',
    borderBottomColor: '#fee2e2',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineDot: {
    backgroundColor: '#16a34a',
  },
  offlineDot: {
    backgroundColor: '#dc2626',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  onlineText: {
    color: '#15803d',
  },
  offlineText: {
    color: '#b91c1c',
  },
  syncBtn: {
    backgroundColor: '#15803d',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  syncBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  syncToast: {
    backgroundColor: '#15803d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  syncToastText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
