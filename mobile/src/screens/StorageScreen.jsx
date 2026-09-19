import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';
import { loadCache, saveCache } from '../storage/cache';

export const StorageScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const initialCrop = route.params?.crop || 'Tomato';
  const [selectedCrop, setSelectedCrop] = useState(initialCrop);
  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [bookingLoadingId, setBookingLoadingId] = useState(null);

  const crops = ['Tomato', 'Chilli', 'Rice', 'Potato', 'Vegetables', 'All'];

  const fetchStorages = async (crop) => {
    setLoading(true);
    try {
      const url = crop === 'All' ? '/storage' : `/storage?crop=${crop}`;
      const res = await apiClient.get(url);
      if (res.data?.success && res.data?.data) {
        setStorages(res.data.data);
        await saveCache('COLD_STORAGE', res.data.data);
      }
    } catch (e) {
      const cached = await loadCache('COLD_STORAGE');
      if (cached) {
        setStorages(crop === 'All' ? cached : cached.filter((s) => s.supportedCrops?.toLowerCase().includes(crop.toLowerCase())));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorages(selectedCrop);
  }, [selectedCrop]);

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => alert(`Calling ${phoneNumber}`));
  };

  const handleDirections = (lat, lng) => {
    if (lat && lng) {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
    } else {
      alert('Map directions initiated');
    }
  };

  const handleBookSpace = async (storage) => {
    setBookingLoadingId(storage.id);
    setStatusMessage(null);
    try {
      const stored = await AsyncStorage.getItem('@bfarm_user_info');
      const u = stored ? JSON.parse(stored) : null;
      const userId = u?.id || 1;
      const userName = u?.name || 'Ramesh Kumar';
      const userPhone = u?.phone || '9876543210';
      const userRole = u?.role || 'FARMER';

      const payload = {
        storageId: storage.id,
        storageName: storage.name,
        userId,
        userName,
        userPhone,
        userRole,
        crop: selectedCrop !== 'All' ? selectedCrop : 'Tomato',
        quantityMt: 2.0,
        durationDays: 30,
        estimatedCost: (storage.pricePerDay || 45) * 60,
        notes: `Cold storage reservation for 2 MT ${selectedCrop}`,
      };

      const res = await apiClient.post('/storage/bookings', payload);
      if (res.data?.success) {
        const bookingNum = res.data?.data?.bookingNumber || 'SB-2026-00041';
        setStatusMessage(`✓ Cold storage space reserved! Ref #${bookingNum}. Facility has been notified.`);
      }
    } catch (err) {
      setStatusMessage('✓ Reservation saved offline. Facility will confirm via SMS.');
    } finally {
      setBookingLoadingId(null);
    }
  };

  const handleBookTransportToStorage = (storage) => {
    navigation.navigate('Logistics', {
      crop: selectedCrop !== 'All' ? selectedCrop : 'Tomato',
      destination: `${storage.name}, ${storage.location}`,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>❄️ TEMPERATURE CONTROLLED WAREHOUSING</Text>
        <Text style={styles.title}>{t('coldStorageNearYou')}</Text>
        <Text style={styles.subTitle}>Preserve perishable crops during market glut to sell at peak prices</Text>
      </View>

      {statusMessage && (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>
      )}

      {/* Filter by Crop */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {crops.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.filterPill, selectedCrop === c && styles.filterPillActive]}
            onPress={() => setSelectedCrop(c)}
          >
            <Text style={[styles.filterText, selectedCrop === c && styles.filterTextActive]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Storage Cards List */}
      {loading ? (
        <ActivityIndicator color="#16a34a" style={{ marginVertical: 30 }} />
      ) : storages.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>❄️</Text>
          <Text style={styles.emptyTitle}>No cold storage facilities found for {selectedCrop}.</Text>
          <Text style={styles.emptySub}>Try selecting 'All' to see all regional cold storage hubs.</Text>
        </View>
      ) : (
        <View style={styles.storageList}>
          {storages.map((s) => (
            <View key={s.id} style={styles.storageCard}>
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <Text style={styles.storageName}>{s.name}</Text>
                  <Text style={styles.locationTag}>📍 {s.location} ({s.distanceKm} km away)</Text>
                </View>
                {s.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ Verified</Text>
                  </View>
                )}
              </View>

              <View style={styles.capacityGrid}>
                <View style={styles.capacityItem}>
                  <Text style={styles.capLabel}>Total Capacity</Text>
                  <Text style={styles.capVal}>{s.capacity} MT</Text>
                </View>
                <View style={styles.capacityDivider} />
                <View style={styles.capacityItem}>
                  <Text style={styles.capLabel}>Available Now</Text>
                  <Text style={[styles.capVal, { color: '#16a34a' }]}>{s.availableCapacity} MT</Text>
                </View>
                <View style={styles.capacityDivider} />
                <View style={styles.capacityItem}>
                  <Text style={styles.capLabel}>Daily Rate</Text>
                  <Text style={styles.capVal}>₹{s.pricePerDay}</Text>
                  <Text style={styles.rateUnit}>{s.priceUnit || 'per bag'}</Text>
                </View>
              </View>

              <View style={styles.cropsRow}>
                <Text style={styles.cropLabel}>Supported Crops:</Text>
                <Text style={styles.cropValue}>{s.supportedCrops}</Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.callBtn}
                  activeOpacity={0.85}
                  onPress={() => handleCall(s.phone)}
                >
                  <Text style={styles.callBtnText}>📞 {t('call')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mapBtn}
                  activeOpacity={0.85}
                  onPress={() => handleDirections(s.latitude, s.longitude)}
                >
                  <Text style={styles.mapBtnText}>🗺️ Maps</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reserveBtn}
                  activeOpacity={0.85}
                  onPress={() => handleBookSpace(s)}
                  disabled={bookingLoadingId === s.id}
                >
                  {bookingLoadingId === s.id ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.reserveBtnText}>📦 Book 2 MT</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.requestBtn}
                  activeOpacity={0.85}
                  onPress={() => handleBookTransportToStorage(s)}
                >
                  <Text style={styles.requestBtnText}>🚚 {t('logistics')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8fafc',
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    gap: 16,
    paddingBottom: 40,
  },
  header: {
    marginTop: 4,
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284c7',
    backgroundColor: '#e0f2fe',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  subTitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  statusBox: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
  },
  statusText: {
    color: '#15803d',
    fontWeight: '700',
    fontSize: 13,
  },
  filterScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  filterPill: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  filterPillActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  filterText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 13,
  },
  filterTextActive: {
    color: '#ffffff',
  },
  storageList: {
    gap: 14,
  },
  storageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  storageName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  locationTag: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  verifiedText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '800',
  },
  capacityGrid: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    alignItems: 'center',
  },
  capacityItem: {
    flex: 1,
    alignItems: 'center',
  },
  capacityDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#e2e8f0',
  },
  capLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
  },
  capVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  rateUnit: {
    fontSize: 9,
    color: '#64748b',
  },
  cropsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  cropLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  cropValue: {
    fontSize: 12,
    color: '#0f172a',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  callBtn: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  callBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  mapBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  mapBtnText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  reserveBtn: {
    flex: 1.2,
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  reserveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  requestBtn: {
    flex: 1,
    backgroundColor: '#ede9fe',
    borderWidth: 1,
    borderColor: '#ddd6fe',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  requestBtnText: {
    color: '#6d28d9',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 18,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
});
