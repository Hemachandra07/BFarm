import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../api/client';
import { loadCache, saveCache } from '../storage/cache';

export const FPOScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const initialCrop = route.params?.crop || 'Tomato';
  const [selectedCrop, setSelectedCrop] = useState(initialCrop);
  const [fpos, setFpos] = useState([]);
  const [loading, setLoading] = useState(false);

  const crops = ['Tomato', 'Chilli', 'Rice', 'Cotton', 'Maize', 'All'];

  const fetchFpos = async (crop) => {
    setLoading(true);
    try {
      const url = crop === 'All' ? '/fpos' : `/fpos?crop=${crop}`;
      const res = await apiClient.get(url);
      if (res.data?.success && res.data?.data) {
        setFpos(res.data.data);
        await saveCache('FPOS', res.data.data);
      }
    } catch (e) {
      const cached = await loadCache('FPOS');
      if (cached) {
        setFpos(crop === 'All' ? cached : cached.filter((f) => f.crops?.toLowerCase().includes(crop.toLowerCase())));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFpos(selectedCrop);
  }, [selectedCrop]);

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      alert(`Calling ${phoneNumber}`);
    });
  };

  return (
    <ScrollView style={styles.scrollWrapper} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>🤝 FARMER PRODUCER ORGANIZATIONS</Text>
          <TouchableOpacity
            style={styles.buyersToggleBtn}
            onPress={() => navigation.navigate('Buyers', { crop: selectedCrop })}
          >
            <Text style={styles.buyersToggleText}>View Buyers →</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>{t('fposNearYou') || 'FPOs Near You'}</Text>
        <Text style={styles.subTitle}>Collective bargaining, input savings, and shared post-harvest infrastructure</Text>
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

      {/* FPOs List */}
      {loading ? (
        <ActivityIndicator color="#16a34a" size="large" style={{ marginVertical: 40 }} />
      ) : fpos.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No FPOs found for {selectedCrop}.</Text>
          <Text style={styles.emptySub}>Try another crop or select 'All'.</Text>
        </View>
      ) : (
        <View style={styles.fpoList}>
          {fpos.map((f) => (
            <View key={f.id} style={styles.fpoCard}>
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <Text style={styles.fpoName}>{f.name}</Text>
                  <Text style={styles.distanceTag}>📍 {f.location} • {f.distanceKm} km away</Text>
                </View>
                {f.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ Registered</Text>
                  </View>
                )}
              </View>

              <View style={styles.memberBox}>
                <View style={styles.memberRow}>
                  <Text style={styles.memberLabel}>👥 Farmer Members</Text>
                  <Text style={styles.memberBold}>{f.memberCount} Farmers</Text>
                </View>
                <View style={styles.cropsRow}>
                  <Text style={styles.cropsLabel}>Crops Handled:</Text>
                  <Text style={styles.cropsValue}>{f.crops}</Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.contactBtn}
                  activeOpacity={0.85}
                  onPress={() => handleCall(f.phone)}
                >
                  <Text style={styles.contactBtnText}>📞 {t('contact') || 'Contact'} FPO</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.logisticsBtn}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('Logistics', { crop: selectedCrop, destination: f.name + ', ' + f.location })}
                >
                  <Text style={styles.logisticsBtnText}>🚚 Book Transport</Text>
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
  buyersToggleBtn: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  buyersToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
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
  fpoList: {
    gap: 16,
  },
  fpoCard: {
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
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  fpoName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  distanceTag: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    marginTop: 3,
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
    color: '#166534',
    fontSize: 11,
    fontWeight: '800',
  },
  memberBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 8,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '700',
  },
  memberBold: {
    color: '#15803d',
    fontWeight: '900',
    fontSize: 14,
  },
  cropsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  cropsLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  cropsValue: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '700',
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contactBtn: {
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
  contactBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  logisticsBtn: {
    flex: 1,
    backgroundColor: '#f5f3ff',
    borderWidth: 1.5,
    borderColor: '#ddd6fe',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logisticsBtnText: {
    color: '#6d28d9',
    fontSize: 14,
    fontWeight: '800',
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
