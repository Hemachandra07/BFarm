import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
  RefreshControl,
} from 'react-native';
import { apiClient, getFriendlyErrorMessage } from '../api/client';

export const AdminScreen = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, logistics, diagnoses, market
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newCrop, setNewCrop] = useState('Tomato');
  const [newMarket, setNewMarket] = useState('Guntur APMC Mandi');
  const [newDistrict, setNewDistrict] = useState('Guntur');
  const [newPrice, setNewPrice] = useState('2850');
  const [newTrend, setNewTrend] = useState('UP');

  const handleAddMarketPrice = async () => {
    if (!newCrop || !newMarket || !newPrice) {
      const msg = 'Please fill crop name, market name, and price.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Missing Fields', msg);
      return;
    }
    try {
      const res = await apiClient.post('/market/prices', {
        crop: newCrop.trim(),
        market: newMarket.trim(),
        district: newDistrict.trim() || 'Guntur',
        state: 'Andhra Pradesh',
        price: parseFloat(newPrice),
        unit: 'quintal',
        trend: newTrend,
        source: 'Admin Official Update',
      });
      if (res.data?.success) {
        const msg = `Market price for ${newCrop} at ${newMarket} added successfully!`;
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Success', msg);
        setNewPrice('');
        loadData();
      }
    } catch (err) {
      const msg = getFriendlyErrorMessage(err);
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
    }
  };

  const handleDeleteMarketPrice = async (id, crop) => {
    try {
      const res = await apiClient.delete(`/market/prices/${id}`);
      if (res.data?.success) {
        loadData();
      }
    } catch (err) {
      console.warn('Failed to delete market price:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await apiClient.get('/admin/stats');
        if (res.data?.success) setStats(res.data.data);
      } else if (activeTab === 'logistics') {
        const res = await apiClient.get('/admin/requests');
        if (res.data?.success) setLogisticsRequests(res.data.data || []);
      } else if (activeTab === 'diagnoses') {
        const res = await apiClient.get('/diagnosis/history');
        if (res.data?.success) setDiagnosisFeed(res.data.data || []);
      } else if (activeTab === 'market') {
        const res = await apiClient.get('/market/prices');
        if (res.data?.success) setMandiPrices(res.data.data || []);
      }
    } catch (err) {
      console.warn('Failed to load admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleUpdateLogisticsStatus = async (id, newStatus) => {
    try {
      const res = await apiClient.patch(`/admin/requests/${id}/status`, { status: newStatus });
      if (res.data?.success) {
        if (Platform.OS === 'web') {
          window.alert(`Dispatch status updated to ${newStatus}`);
        } else {
          Alert.alert('Status Updated', `Request status updated to ${newStatus}`);
        }
        loadData();
      }
    } catch (err) {
      const msg = getFriendlyErrorMessage(err);
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
    }
  };

  const handleTriggerReseed = async () => {
    const confirmAction = () => {
      apiClient.post('/admin/reseed')
        .then(res => {
          if (res.data?.success) {
            const msg = 'Demo agricultural telemetry re-seeded successfully!';
            if (Platform.OS === 'web') window.alert(msg);
            else Alert.alert('Success', msg);
            loadData();
          }
        })
        .catch(err => {
          const msg = getFriendlyErrorMessage(err);
          if (Platform.OS === 'web') window.alert(msg);
          else Alert.alert('Error', msg);
        });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Re-seed initial demo dataset?')) confirmAction();
    } else {
      Alert.alert(
        'Re-seed System Data',
        'Are you sure you want to reset and re-seed initial agricultural demo data?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Re-seed', style: 'destructive', onPress: confirmAction }
        ]
      );
    }
  };

  const openFullWebDashboard = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open('/admin/index.html', '_blank');
    } else {
      Linking.openURL('http://10.142.28.128:8080/admin/index.html');
    }
  };

  return (
    <ScrollView
      style={styles.wrapper}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Admin Header */}
      <View style={styles.headerCard}>
        <View style={styles.badgeRow}>
          <Text style={styles.adminBadge}>🛡️ SYSTEM ADMIN COMMAND CENTER</Text>
          <View style={styles.liveTag}>
            <Text style={styles.liveTagText}>● SYSTEM ACTIVE</Text>
          </View>
        </View>
        <Text style={styles.headerTitle}>AgriCare Telemetry & Operations</Text>
        <Text style={styles.headerSub}>
          Real-time agricultural telemetry, dispatch management, disease analytics & market rates.
        </Text>
      </View>

      {/* Admin Operations Sub-Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'overview' && styles.tabBtnActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            📊 Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'logistics' && styles.tabBtnActive]}
          onPress={() => setActiveTab('logistics')}
        >
          <Text style={[styles.tabText, activeTab === 'logistics' && styles.tabTextActive]}>
            🚚 Dispatch
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'diagnoses' && styles.tabBtnActive]}
          onPress={() => setActiveTab('diagnoses')}
        >
          <Text style={[styles.tabText, activeTab === 'diagnoses' && styles.tabTextActive]}>
            🌱 Diagnostics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'market' && styles.tabBtnActive]}
          onPress={() => setActiveTab('market')}
        >
          <Text style={[styles.tabText, activeTab === 'market' && styles.tabTextActive]}>
            💰 Mandi Rates
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing && (
        <ActivityIndicator size="large" color="#16a34a" style={{ marginVertical: 20 }} />
      )}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && stats && (
        <View style={styles.sectionGap}>
          <Text style={styles.sectionTitle}>📈 Executive Operational Statistics</Text>
          
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiIcon}>👨‍🌾</Text>
              <Text style={styles.kpiValue}>{stats.totalFarmers || 0}</Text>
              <Text style={styles.kpiLabel}>Registered Farmers</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiIcon}>🔬</Text>
              <Text style={styles.kpiValue}>{stats.totalDiagnoses || 0}</Text>
              <Text style={styles.kpiLabel}>AI Crop Scans</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiIcon}>🚚</Text>
              <Text style={styles.kpiValue}>{stats.totalLogisticsRequests || 0}</Text>
              <Text style={styles.kpiLabel}>Dispatch Requests</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiIcon}>❄️</Text>
              <Text style={styles.kpiValue}>{stats.totalStorageRequests || 0}</Text>
              <Text style={styles.kpiLabel}>Storage Bookings</Text>
            </View>
          </View>

          {/* Disease Pathology Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🦠 Top Disease Analytics</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Most Diagnosed Crop:</Text>
              <Text style={styles.infoVal}>{stats.topCrop || 'Tomato'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Primary Disease Outbreak:</Text>
              <Text style={styles.infoValAlert}>{stats.topDisease || 'Early Blight'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Market Price Searches:</Text>
              <Text style={styles.infoVal}>{stats.totalMarketSearches || 0} queries</Text>
            </View>
          </View>
        </View>
      )}

      {/* 2. DISPATCH CONTROL TAB */}
      {activeTab === 'logistics' && (
        <View style={styles.sectionGap}>
          <Text style={styles.sectionTitle}>🚚 Transport & Dispatch Requests ({logisticsRequests.length})</Text>
          {logisticsRequests.length === 0 ? (
            <Text style={styles.emptyText}>No logistics requests logged yet.</Text>
          ) : (
            logisticsRequests.map((req) => (
              <View key={req.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.refCode}>ID: {req.referenceNumber}</Text>
                  <View style={[styles.statusBadge, styles[`status_${req.status}`]]}>
                    <Text style={styles.statusText}>{req.status}</Text>
                  </View>
                </View>

                <Text style={styles.cardCrop}>
                  🌾 {req.crop} • {req.quantity} kg
                </Text>

                <Text style={styles.cardDetail}>📍 Pickup: {req.pickupLocation}</Text>
                <Text style={styles.cardDetail}>🏁 Destination: {req.destination}</Text>
                <Text style={styles.cardPrice}>💰 Cost: ₹{req.estimatedCost}</Text>

                {/* Status Changer Actions */}
                <Text style={styles.actionLabel}>Update Dispatch Status:</Text>
                <View style={styles.statusActionRow}>
                  {['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'].map((st) => (
                    <TouchableOpacity
                      key={st}
                      style={[
                        styles.statusBtn,
                        req.status === st && styles.statusBtnActive,
                      ]}
                      onPress={() => handleUpdateLogisticsStatus(req.id, st)}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          req.status === st && styles.statusBtnTextActive,
                        ]}
                      >
                        {st}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* 3. DIAGNOSTICS FEED TAB */}
      {activeTab === 'diagnoses' && (
        <View style={styles.sectionGap}>
          <Text style={styles.sectionTitle}>🌱 Real-time Crop Pathology Scans</Text>
          {diagnosisFeed.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardCrop}>🔬 {item.crop} - {item.disease}</Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>
                    {Math.round((item.confidence || 0.9) * 100)}% Match
                  </Text>
                </View>
              </View>

              <Text style={styles.cardDetail}>
                Severity Level: <Text style={{ fontWeight: '800', color: '#dc2626' }}>{item.severity || 'Medium'}</Text>
              </Text>
              <Text style={styles.findingsText}>{item.findings || 'Symptom analysis recorded.'}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 4. MANDI RATES TAB */}
      {activeTab === 'market' && (
        <View style={styles.sectionGap}>
          {/* Form to Add / Update Market Price */}
          <View style={styles.addPriceCard}>
            <Text style={styles.addPriceTitle}>➕ Add / Update Mandi Price (Admin)</Text>
            <Text style={styles.addPriceDesc}>
              Newly added market prices will immediately reflect in the Farmer Module for all users.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Crop Name</Text>
              <TextInput
                style={styles.formInput}
                value={newCrop}
                onChangeText={setNewCrop}
                placeholder="e.g. Tomato, Chilli, Rice, Cotton"
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Market / Mandi Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={newMarket}
                  onChangeText={setNewMarket}
                  placeholder="e.g. Guntur APMC Yard"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>District</Text>
                <TextInput
                  style={styles.formInput}
                  value={newDistrict}
                  onChangeText={setNewDistrict}
                  placeholder="e.g. Guntur"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Price (₹ / quintal)</Text>
                <TextInput
                  style={styles.formInput}
                  value={newPrice}
                  onChangeText={setNewPrice}
                  keyboardType="numeric"
                  placeholder="e.g. 2850"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Price Trend</Text>
                <View style={styles.trendRow}>
                  {['UP', 'STABLE', 'DOWN'].map((tr) => (
                    <TouchableOpacity
                      key={tr}
                      style={[styles.trendPill, newTrend === tr && styles.trendPillActive]}
                      onPress={() => setNewTrend(tr)}
                    >
                      <Text style={[styles.trendPillText, newTrend === tr && styles.trendPillTextActive]}>
                        {tr === 'UP' ? '▲ UP' : (tr === 'DOWN' ? '▼ DOWN' : '— STABLE')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.submitPriceBtn} onPress={handleAddMarketPrice}>
              <Text style={styles.submitPriceBtnText}>✨ Publish Market Price to Farmer Module</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>💰 Active Mandi Benchmark Rates ({mandiPrices.length})</Text>
          {mandiPrices.map((p) => (
            <View key={p.id} style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mandiName}>{p.market}</Text>
                <Text style={styles.mandiSub}>{p.crop} • {p.district}, {p.state} • Source: {p.source || 'Admin'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={styles.mandiPrice}>₹{p.price}</Text>
                <Text style={styles.mandiUnit}>/ {p.unit}</Text>
                <TouchableOpacity onPress={() => handleDeleteMarketPrice(p.id, p.crop)}>
                  <Text style={{ fontSize: 10, color: '#dc2626', fontWeight: '800' }}>🗑️ Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Quick Admin Actions */}
      <View style={styles.adminActionsCard}>
        <Text style={styles.cardTitle}>⚙️ System Administration</Text>
        
        <TouchableOpacity style={styles.reseedBtn} onPress={handleTriggerReseed}>
          <Text style={styles.reseedBtnText}>🔄 Re-seed Baseline Agricultural Demo Data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.webDashboardBtn} onPress={openFullWebDashboard}>
          <Text style={styles.webDashboardText}>🖥️ Open Desktop Web Command Center →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 20, maxWidth: 640, width: '100%', alignSelf: 'center', gap: 16, paddingBottom: 40 },
  headerCard: { backgroundColor: '#0f172a', borderRadius: 20, padding: 20 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  adminBadge: { fontSize: 11, fontWeight: '900', color: '#f59e0b', letterSpacing: 0.5 },
  liveTag: { backgroundColor: '#1e293b', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  liveTagText: { fontSize: 10, fontWeight: '800', color: '#22c55e' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#ffffff' },
  headerSub: { fontSize: 12, color: '#94a3b8', marginTop: 4, lineHeight: 18 },

  tabBar: { flexDirection: 'row', gap: 6, backgroundColor: '#e2e8f0', padding: 4, borderRadius: 14 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabBtnActive: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  tabText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  tabTextActive: { color: '#0f172a', fontWeight: '900' },

  sectionGap: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginTop: 4 },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpiCard: { width: '48%', backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  kpiIcon: { fontSize: 28, marginBottom: 4 },
  kpiValue: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  kpiLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', marginTop: 2, textAlign: 'center' },

  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  infoLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  infoVal: { fontSize: 13, fontWeight: '800', color: '#0f172a' },
  infoValAlert: { fontSize: 13, fontWeight: '800', color: '#dc2626' },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  refCode: { fontSize: 13, fontWeight: '900', color: '#0f172a' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#f1f5f9' },
  statusText: { fontSize: 10, fontWeight: '800', color: '#334155' },
  status_PENDING: { backgroundColor: '#fef3c7' },
  status_CONFIRMED: { backgroundColor: '#dbeafe' },
  status_IN_TRANSIT: { backgroundColor: '#e0e7ff' },
  status_COMPLETED: { backgroundColor: '#dcfce7' },
  status_CANCELLED: { backgroundColor: '#fee2e2' },

  cardCrop: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  cardDetail: { fontSize: 13, color: '#475569' },
  cardPrice: { fontSize: 14, fontWeight: '800', color: '#16a34a' },
  findingsText: { fontSize: 12, color: '#64748b', fontStyle: 'italic', marginTop: 2 },

  actionLabel: { fontSize: 11, fontWeight: '800', color: '#64748b', marginTop: 6, textTransform: 'uppercase' },
  statusActionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  statusBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1' },
  statusBtnActive: { backgroundColor: '#15803d', borderColor: '#15803d' },
  statusBtnText: { fontSize: 10, fontWeight: '800', color: '#334155' },
  statusBtnTextActive: { color: '#ffffff' },

  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  mandiName: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  mandiSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  mandiPrice: { fontSize: 16, fontWeight: '900', color: '#16a34a' },
  mandiUnit: { fontSize: 11, color: '#64748b' },

  emptyText: { color: '#64748b', textAlign: 'center', marginVertical: 10 },
  confidenceBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  confidenceText: { fontSize: 11, fontWeight: '800', color: '#15803d' },

  addPriceCard: { backgroundColor: '#ffffff', borderRadius: 18, padding: 18, borderWidth: 1.5, borderColor: '#bbf7d0', gap: 10 },
  addPriceTitle: { fontSize: 16, fontWeight: '900', color: '#15803d' },
  addPriceDesc: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  formRow: { flexDirection: 'row', gap: 10 },
  formInput: { borderWidth: 1.5, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: '#0f172a', backgroundColor: '#f8fafc' },
  label: { fontSize: 11, fontWeight: '800', color: '#475569', marginBottom: 2 },
  inputGroup: { gap: 2 },
  trendRow: { flexDirection: 'row', gap: 4, marginTop: 2 },
  trendPill: { flex: 1, backgroundColor: '#f1f5f9', paddingVertical: 6, paddingHorizontal: 4, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
  trendPillActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  trendPillText: { fontSize: 10, fontWeight: '800', color: '#475569' },
  trendPillTextActive: { color: '#ffffff' },
  submitPriceBtn: { backgroundColor: '#16a34a', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 6 },
  submitPriceBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },

  adminActionsCard: { backgroundColor: '#ffffff', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#e2e8f0', gap: 10, marginTop: 10 },
  reseedBtn: { backgroundColor: '#eff6ff', paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#bfdbfe' },
  reseedBtnText: { color: '#1d4ed8', fontWeight: '800', fontSize: 13 },
  webDashboardBtn: { backgroundColor: '#0f172a', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  webDashboardText: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
});
