import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Linking, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { changeAppLanguage } from '../localization/i18n';
import { getPendingRequests } from '../storage/offlineQueue';
import { syncOfflineDataWithServer } from '../services/syncService';

export const ProfileScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState({
    name: 'Ramesh Kumar (Demo Farmer)',
    phone: '9876543210',
    role: 'FARMER',
    district: 'Guntur',
    village: 'Tenali',
    state: 'Andhra Pradesh',
  });
  const [pendingCount, setPendingCount] = useState(0);
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const raw = await AsyncStorage.getItem('@bfarm_user_info');
        if (raw) setUser(JSON.parse(raw));

        const pending = await getPendingRequests();
        setPendingCount(pending.length);
      } catch (e) {
        // Ignore
      }
    };
    loadData();
  }, []);

  const handleLanguageChange = async (lang) => {
    await changeAppLanguage(lang);
  };

  const handleSyncNow = async () => {
    setSyncStatus('Synchronizing offline data with central server...');
    const res = await syncOfflineDataWithServer(user.id || 1);
    setSyncStatus(res.message);
    const pending = await getPendingRequests();
    setPendingCount(pending.length);
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@bfarm_auth_token');
    await AsyncStorage.removeItem('@bfarm_user_info');
    await AsyncStorage.removeItem('@bfarm_role');
    navigation.replace('Login');
  };

  const getRoleIcon = (r) => {
    if (r === 'BUYER') return '🏢';
    if (r === 'FPO') return '🤝';
    if (r === 'STORAGE_PROVIDER') return '❄️';
    if (r === 'LOGISTICS_PROVIDER') return '🚚';
    if (r === 'ADMIN') return '🛡️';
    return '👨‍🌾';
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarIcon}>{getRoleIcon(user.role)}</Text>
        </View>
        <Text style={styles.userName}>{user.name || 'User'}</Text>
        <Text style={styles.userPhone}>📱 {user.phone}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user.role || 'FARMER'} ACCOUNT</Text>
        </View>
        <Text style={styles.userLocation}>
          📍 {user.village ? `${user.village}, ` : ''}{user.district}, {user.state || 'Andhra Pradesh'}
        </Text>
      </View>

      {/* Role Navigation Quick Access */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚡ Role Specific Portals</Text>
        <Text style={styles.cardDesc}>Switch between views or explore marketplace services across roles:</Text>

        <View style={styles.portalRow}>
          <TouchableOpacity style={styles.portalBtn} onPress={() => navigation.navigate('ProduceListing')}>
            <Text style={styles.portalIcon}>📢</Text>
            <Text style={styles.portalText}>List Produce</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.portalBtn} onPress={() => navigation.navigate('FarmerOrders')}>
            <Text style={styles.portalIcon}>🤝</Text>
            <Text style={styles.portalText}>Buyer Offers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.portalBtn} onPress={() => navigation.navigate('BrowseProduce')}>
            <Text style={styles.portalIcon}>🛒</Text>
            <Text style={styles.portalText}>Buy Produce</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.portalRow}>
          <TouchableOpacity style={styles.portalBtn} onPress={() => navigation.navigate('StorageProvider')}>
            <Text style={styles.portalIcon}>❄️</Text>
            <Text style={styles.portalText}>Cold Storage</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.portalBtn} onPress={() => navigation.navigate('LogisticsProvider')}>
            <Text style={styles.portalIcon}>🚚</Text>
            <Text style={styles.portalText}>Logistics Hub</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.portalBtn} onPress={() => navigation.navigate('BuyerOrders')}>
            <Text style={styles.portalIcon}>📦</Text>
            <Text style={styles.portalText}>Buyer Orders</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Preference Setting */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌐 App Language / భాష / भाषा</Text>
        <View style={styles.langButtonRow}>
          <TouchableOpacity
            style={[styles.langBtn, i18n.language === 'te' && styles.langBtnActive]}
            onPress={() => handleLanguageChange('te')}
          >
            <Text style={[styles.langBtnText, i18n.language === 'te' && styles.langBtnTextActive]}>తెలుగు</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langBtn, i18n.language === 'hi' && styles.langBtnActive]}
            onPress={() => handleLanguageChange('hi')}
          >
            <Text style={[styles.langBtnText, i18n.language === 'hi' && styles.langBtnTextActive]}>हिंदी</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langBtn, i18n.language === 'en' && styles.langBtnActive]}
            onPress={() => handleLanguageChange('en')}
          >
            <Text style={[styles.langBtnText, i18n.language === 'en' && styles.langBtnTextActive]}>English</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Offline & Synchronization Manager */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚡ Offline-First & Sync Control</Text>
        <Text style={styles.cardDesc}>
          Simulate offline behavior to verify that bookings and diagnosis history work smoothly without internet.
        </Text>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Simulate Offline Mode (Network OFF)</Text>
          <Switch
            value={simulateOffline}
            onValueChange={setSimulateOffline}
            trackColor={{ false: '#cbd5e1', true: '#ef4444' }}
            thumbColor={simulateOffline ? '#dc2626' : '#f8fafc'}
          />
        </View>

        <View style={styles.syncBox}>
          <Text style={styles.syncCountText}>
            Offline Pending Queue: <Text style={styles.boldText}>{pendingCount} requests</Text>
          </Text>

          {syncStatus && (
            <Text style={styles.syncStatusAlert}>{syncStatus}</Text>
          )}

          <TouchableOpacity
            style={[styles.syncBtn, pendingCount === 0 && styles.syncBtnDisabled]}
            onPress={handleSyncNow}
            disabled={pendingCount === 0}
          >
            <Text style={styles.syncBtnText}>🔄 {t('syncNow')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Admin Command Center Link */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🛡️ Administrator Command Center</Text>
        <Text style={styles.cardDesc}>
          Open the Web Admin Command Center to view live agricultural statistics, disease feed, mandi benchmark prices, and dispatch status.
        </Text>
        <TouchableOpacity
          style={styles.adminBtn}
          onPress={() => {
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
              window.open('/admin/index.html', '_blank');
            } else {
              Linking.openURL('http://10.142.28.128:8080/admin/index.html');
            }
          }}
        >
          <Text style={styles.adminBtnText}>🖥️ Open Admin Command Center →</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Text style={styles.logoutText}>🚪 Sign Out / Switch User</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8fafc',
    gap: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 4,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#86efac',
  },
  avatarIcon: {
    fontSize: 42,
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  userPhone: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  roleBadge: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginVertical: 10,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d',
  },
  userLocation: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 14,
    lineHeight: 18,
  },
  portalRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  portalBtn: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 3,
  },
  portalIcon: {
    fontSize: 20,
  },
  portalText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
  },
  langButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  langBtn: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  langBtnActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  langBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  langBtnTextActive: {
    color: '#15803d',
    fontWeight: '800',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 14,
  },
  switchLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  syncBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
  },
  syncCountText: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '800',
    color: '#0f172a',
  },
  syncStatusAlert: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '700',
    marginBottom: 8,
  },
  syncBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  syncBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
  syncBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  adminBtn: {
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  adminBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  logoutBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#fca5a5',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '800',
  },
});
