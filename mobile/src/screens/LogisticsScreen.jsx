import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../api/client';
import { enqueueOfflineRequest } from '../storage/offlineQueue';

export const LogisticsScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const initialCrop = route.params?.crop || 'Tomato';
  const initialDestination = route.params?.destination || 'Sri Sai Cold Storage, Guntur';
  const initialQuantity = route.params?.quantity || '500';

  const [crop, setCrop] = useState(initialCrop);
  const [quantity, setQuantity] = useState(String(initialQuantity));
  const [pickup, setPickup] = useState('My Farm, Tenali Rural, Guntur');
  const [destination, setDestination] = useState(initialDestination);
  const [selectedVehicle, setSelectedVehicle] = useState(0);
  const [loading, setLoading] = useState(false);

  const vehicleOptions = [
    { type: 'Mini Truck (Tata Ace)', capacity: '1 Ton', cost: 1200, icon: '🛻', tag: 'Best for Small Lots' },
    { type: 'Pickup Truck (Bolero Maxi)', capacity: '2 Ton', cost: 1800, icon: '🚚', tag: 'Most Popular' },
    { type: 'Canter Medium Truck', capacity: '4 Ton', cost: 3200, icon: '🚛', tag: 'Best for Bulk' },
  ];

  const handleSubmitBooking = async () => {
    setLoading(true);
    const chosen = vehicleOptions[selectedVehicle];
    const payload = {
      farmerId: 1,
      pickupLocation: pickup,
      destination,
      crop,
      quantity: parseFloat(quantity) || 500,
      estimatedCost: chosen.cost,
      providerName: chosen.type,
      farmerPhone: '9876543210',
    };

    try {
      const res = await apiClient.post('/logistics/request', payload);
      if (res.data?.success && res.data?.data) {
        navigation.replace('BookingConfirmation', {
          request: res.data.data,
          isOfflineSaved: false,
        });
        return;
      }
    } catch (err) {
      console.warn('Network unavailable, storing in offline sync queue:', err.message);
    }

    await enqueueOfflineRequest('LOGISTICS_REQUEST', payload);
    const offlineReference = 'AC-2026-00124';
    navigation.replace('BookingConfirmation', {
      request: {
        referenceNumber: offlineReference,
        crop,
        quantity: parseFloat(quantity) || 500,
        estimatedCost: chosen.cost,
        pickupLocation: pickup,
        destination,
        status: 'PENDING',
      },
      isOfflineSaved: true,
    });
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>🚚 FARM-TO-MARKET TRANSPORT</Text>
        <Text style={styles.title}>{t('transportTitle')}</Text>
        <Text style={styles.subTitle}>Book verified rural mini-trucks and farm transport at fair government-benchmarked rates</Text>
      </View>

      {/* Booking Details Form */}
      <View style={styles.formCard}>
        <Text style={styles.formSectionTitle}>Produce Details</Text>

        <View style={styles.inputRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Crop</Text>
            <TextInput style={styles.textInput} value={crop} onChangeText={setCrop} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Quantity (kg)</Text>
            <TextInput style={styles.textInput} value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Pickup Location (Farmgate)</Text>
          <TextInput style={styles.textInput} value={pickup} onChangeText={setPickup} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Destination (Mandi, Buyer, or Cold Storage)</Text>
          <TextInput style={styles.textInput} value={destination} onChangeText={setDestination} />
        </View>
      </View>

      {/* Select Vehicle Option */}
      <View style={styles.vehiclesSection}>
        <Text style={styles.vehiclesTitle}>Select Vehicle & Capacity:</Text>
        <View style={styles.vehicleList}>
          {vehicleOptions.map((v, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.vehicleCard, selectedVehicle === i && styles.vehicleCardActive]}
              activeOpacity={0.85}
              onPress={() => setSelectedVehicle(i)}
            >
              <View style={styles.vehicleLeft}>
                <Text style={styles.vehicleIcon}>{v.icon}</Text>
                <View>
                  <Text style={[styles.vehicleType, selectedVehicle === i && styles.textActive]}>{v.type}</Text>
                  <Text style={styles.vehicleCap}>Capacity: {v.capacity} • <Text style={styles.vehicleTag}>{v.tag}</Text></Text>
                </View>
              </View>

              <View style={styles.vehicleRight}>
                <Text style={styles.vehicleCost}>₹{v.cost}</Text>
                <Text style={styles.costUnit}>Est. Fare</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitBtn}
        activeOpacity={0.88}
        disabled={loading}
        onPress={handleSubmitBooking}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitBtnText}>🚚 {t('submitRequest')} →</Text>
        )}
      </TouchableOpacity>
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
    color: '#7c3aed',
    backgroundColor: '#ede9fe',
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
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {},
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },
  vehiclesSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  vehiclesTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  vehicleList: {
    gap: 10,
  },
  vehicleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  vehicleCardActive: {
    borderColor: '#7c3aed',
    backgroundColor: '#f5f3ff',
  },
  vehicleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  vehicleIcon: {
    fontSize: 28,
  },
  vehicleType: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  textActive: {
    color: '#6d28d9',
  },
  vehicleCap: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  vehicleTag: {
    color: '#7c3aed',
    fontWeight: '700',
  },
  vehicleRight: {
    alignItems: 'flex-end',
  },
  vehicleCost: {
    fontSize: 17,
    fontWeight: '900',
    color: '#15803d',
  },
  costUnit: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
});
