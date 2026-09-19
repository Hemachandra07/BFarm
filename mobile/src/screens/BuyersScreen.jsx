import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../api/client';
import { loadCache, saveCache } from '../storage/cache';

export const BuyersScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const initialCrop = route.params?.crop || 'Tomato';
  const [selectedCrop, setSelectedCrop] = useState(initialCrop);
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(false);

  const crops = ['Tomato', 'Chilli', 'Rice', 'Cotton', 'Maize', 'All'];

  const fetchBuyers = async (crop) => {
    setLoading(true);
    try {
      const url = crop === 'All' ? '/buyers' : `/buyers?crop=${crop}`;
      const res = await apiClient.get(url);
      if (res.data?.success && res.data?.data) {
        setBuyers(res.data.data);
        await saveCache('BUYERS', res.data.data);
      }
    } catch (e) {
      const cached = await loadCache('BUYERS');
      if (cached) {
        setBuyers(crop === 'All' ? cached : cached.filter((b) => b.crops?.toLowerCase().includes(crop.toLowerCase())));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers(selectedCrop);
  }, [selectedCrop]);

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      alert(`Calling ${phoneNumber}`);
    });
  };

  return (
    <ScrollView style={styles.scrollWrapper} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>🤝 DIRECT BUYERS DIRECTORY</Text>
          <TouchableOpacity
            style={styles.fpoToggleBtn}
            onPress={() => navigation.navigate('FPO', { crop: selectedCrop })}
          >
            <Text style={styles.fpoToggleText}>View FPOs →</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>{t('buyersNearYou') || 'Buyers Near You'}</Text>
        <Text style={styles.subTitle}>Verified institutional food processors, wholesalers, and retail aggregators</Text>
      </View>

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

      {/* Buyers Cards List */}
      {loading ? (
        <ActivityIndicator color="#16a34a" size="large" style={{ marginVertical: 40 }} />
      ) : buyers.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No buyers found for {selectedCrop}.</Text>
          <Text style={styles.emptySub}>Try expanding your search or selecting 'All'.</Text>
        </View>
      ) : (
        <View style={styles.buyersList}>
          {buyers.map((b) => (
            <View key={b.id} style={styles.buyerCard}>
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <Text style={styles.buyerName}>{b.name}</Text>
                  <Text style={styles.buyerType}>🏢 {b.buyerType || 'Food Processor / Wholesaler'}</Text>
                </View>
                {b.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ Verified</Text>
                  </View>
                )}
              </View>

              <View style={styles.locationRow}>
                <Text style={styles.locationText}>📍 {b.location}, {b.district}</Text>
              </View>

              <View style={styles.cropsRow}>
                <Text style={styles.cropsLabel}>Purchasing:</Text>
                <Text style={styles.cropsValue}>{b.crops}</Text>
              </View>

              <View style={styles.priceRow}>
                <View>
                  <Text style={styles.priceLabel}>Offered Farmgate Rate</Text>
                  <Text style={styles.priceSub}>Net payment at farm pickup</Text>
                </View>
                <Text style={styles.priceValue}>₹{Number(b.offeredPrice).toLocaleString()}<Text style={styles.priceUnit}>/q</Text></Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.callBtn}
                  activeOpacity={0.85}
                  onPress={() => handleCall(b.phone)}
                >
                  <Text style={styles.callBtnText}>📞 {t('call') || 'Call Buyer'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.transportBtn}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('Logistics', { crop: selectedCrop, destination: b.name + ', ' + b.location })}
                >
                  <Text style={styles.transportBtnText}>🚚 {t('logistics') || 'Logistics & Transport'}</Text>
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
  scrollWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 20,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    gap: 16,
    paddingBottom: 48,
  },
  header: {
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  fpoToggleBtn: {
    backgroundColor: '#eff6ff',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  fpoToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },
  filterScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  filterPill: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  filterPillActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  filterText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#ffffff',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  buyersList: {
    gap: 16,
  },
  buyerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  buyerName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  buyerType: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
    fontWeight: '600',
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d',
  },
  locationRow: {
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  cropsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  cropsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  cropsValue: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '700',
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
    marginVertical: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '700',
  },
  priceSub: {
    fontSize: 11,
    color: '#15803d',
    marginTop: 1,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#15803d',
  },
  priceUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  callBtn: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  callBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  transportBtn: {
    flex: 1,
    backgroundColor: '#f5f3ff',
    borderWidth: 1.5,
    borderColor: '#ddd6fe',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transportBtnText: {
    color: '#6d28d9',
    fontSize: 14,
    fontWeight: '800',
  },
});
