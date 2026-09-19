import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, getFriendlyErrorMessage } from '../api/client';
import { NetworkBanner } from '../components/NetworkBanner';

export const ProduceListingScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [crop, setCrop] = useState('Tomato');
  const [quantityKg, setQuantityKg] = useState('500');
  const [askingPrice, setAskingPrice] = useState('2700');
  const [location, setLocation] = useState('Tenali Farm Gate');
  const [district, setDistrict] = useState('Guntur');
  const [notes, setNotes] = useState('Grade-A hybrid red tomatoes, freshly harvested.');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [farmerListings, setFarmerListings] = useState([]);
  const [farmerUser, setFarmerUser] = useState(null);

  const cropOptions = [
    { name: 'Tomato', icon: '🍅' },
    { name: 'Chilli', icon: '🌶️' },
    { name: 'Rice', icon: '🌾' },
    { name: 'Cotton', icon: '☁️' },
    { name: 'Maize', icon: '🌽' },
  ];

  useEffect(() => {
    loadUserAndListings();
  }, []);

  const loadUserAndListings = async () => {
    try {
      const stored = await AsyncStorage.getItem('@bfarm_user_info');
      if (stored) {
        const u = JSON.parse(stored);
        setFarmerUser(u);
        const farmerId = u.id || 1;
        const res = await apiClient.get(`/produce/listings/farmer/${farmerId}`);
        if (res.data?.success && res.data?.data) {
          setFarmerListings(res.data.data);
        }
      }
    } catch (e) {
      console.warn('Failed to load farmer listings:', e);
    }
  };

  const handleCreateListing = async () => {
    if (!crop || !quantityKg || !askingPrice) {
      setStatusMessage('Please specify crop, quantity in kg, and asking price.');
      return;
    }

    setLoading(true);
    setStatusMessage(null);
    try {
      const farmerId = farmerUser?.id || 1;
      const farmerName = farmerUser?.name || 'Ramesh Kumar (Farmer)';
      const farmerPhone = farmerUser?.phone || '9876543210';

      const payload = {
        farmerId,
        farmerName,
        farmerPhone,
        crop,
        quantityKg: parseFloat(quantityKg),
        askingPricePerQuintal: parseFloat(askingPrice),
        location,
        district,
        notes,
        status: 'AVAILABLE',
      };

      const res = await apiClient.post('/produce/listings', payload);
      if (res.data?.success) {
        setStatusMessage('✓ Produce listed successfully! Buyers and FPOs can now view and send offers.');
        loadUserAndListings();
      }
    } catch (err) {
      setStatusMessage(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <NetworkBanner />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.badge}>👨‍🌾 DIRECT FARM-GATE SALE</Text>
          <Text style={styles.title}>List Produce for Sale</Text>
          <Text style={styles.subTitle}>Sell directly to verified traders, wholesalers, and FPOs without middlemen</Text>
        </View>

        {statusMessage && (
          <View style={[styles.statusBox, statusMessage.startsWith('✓') ? styles.statusSuccess : styles.statusError]}>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        )}

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>1. Select Crop</Text>
          <View style={styles.cropRow}>
            {cropOptions.map((c) => (
              <TouchableOpacity
                key={c.name}
                style={[styles.cropChip, crop === c.name && styles.cropChipActive]}
                onPress={() => setCrop(c.name)}
              >
                <Text style={styles.cropIcon}>{c.icon}</Text>
                <Text style={[styles.cropName, crop === c.name && styles.cropNameActive]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.rowTwo}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Quantity (Kg)</Text>
              <TextInput
                style={styles.input}
                value={quantityKg}
                onChangeText={setQuantityKg}
                keyboardType="numeric"
                placeholder="500"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Asking Price (₹/Quintal)</Text>
              <TextInput
                style={styles.input}
                value={askingPrice}
                onChangeText={setAskingPrice}
                keyboardType="numeric"
                placeholder="2700"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pickup Location (Farmgate)</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Tenali Farm Gate, Guntur"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quality / Harvest Notes</Text>
            <TextInput
              style={[styles.input, { height: 60 }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Grade-A hybrid red tomatoes, freshly harvested."
              multiline
            />
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleCreateListing}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>📢 Post Listing to Marketplace</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Existing Farmer Listings */}
        <View style={styles.listingsSection}>
          <Text style={styles.sectionHeader}>Your Active Produce Listings ({farmerListings.length})</Text>
          {farmerListings.map((item) => (
            <View key={item.id} style={styles.listingCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardCrop}>{item.crop === 'Tomato' ? '🍅' : item.crop === 'Chilli' ? '🌶️' : '🌾'} {item.crop}</Text>
                <View style={[styles.statusBadge, item.status === 'AVAILABLE' ? styles.badgeAvail : styles.badgeSold]}>
                  <Text style={styles.statusBadgeText}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.cardDetails}>
                <Text style={styles.cardQuantity}>Quantity: <Text style={styles.bold}>{item.quantityKg} kg</Text> ({(item.quantityKg / 100).toFixed(1)} Quintals)</Text>
                <Text style={styles.cardPrice}>Asking Rate: <Text style={styles.boldGreen}>₹{item.askingPricePerQuintal} / quintal</Text></Text>
                <Text style={styles.cardLoc}>📍 {item.location}, {item.district}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 18,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 16,
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  subTitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  statusBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  statusSuccess: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
    borderWidth: 1,
  },
  statusError: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    borderWidth: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 10,
  },
  cropRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  cropChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  cropChipActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  cropIcon: {
    fontSize: 16,
  },
  cropName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  cropNameActive: {
    color: '#15803d',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  submitBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  listingsSection: {
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  listingCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardCrop: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeAvail: {
    backgroundColor: '#dcfce7',
  },
  badgeSold: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d',
  },
  cardDetails: {
    gap: 4,
  },
  cardQuantity: {
    fontSize: 13,
    color: '#334155',
  },
  cardPrice: {
    fontSize: 13,
    color: '#334155',
  },
  cardLoc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  bold: {
    fontWeight: '700',
    color: '#0f172a',
  },
  boldGreen: {
    fontWeight: '800',
    color: '#16a34a',
  },
});
