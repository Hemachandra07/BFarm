import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, getFriendlyErrorMessage } from '../api/client';
import { NetworkBanner } from '../components/NetworkBanner';

export const BrowseProduceScreen = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('ALL');
  const [buyerUser, setBuyerUser] = useState(null);

  // Offer Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [activeListing, setActiveListing] = useState(null);
  const [offeredPrice, setOfferedPrice] = useState('');
  const [offerQuantity, setOfferQuantity] = useState('');
  const [destination, setDestination] = useState('Vijayawada Wholesale APMC');
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadUserAndListings();
  }, [selectedCrop]);

  const loadUserAndListings = async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('@bfarm_user_info');
      if (stored) {
        setBuyerUser(JSON.parse(stored));
      }

      let url = '/produce/listings';
      if (selectedCrop !== 'ALL') {
        url += `?crop=${selectedCrop}`;
      }

      const res = await apiClient.get(url);
      if (res.data?.success && res.data?.data) {
        setListings(res.data.data);
      }
    } catch (e) {
      console.warn('Failed to load produce listings:', e);
    } finally {
      setLoading(false);
    }
  };

  const openOfferModal = (listing) => {
    setActiveListing(listing);
    setOfferedPrice(String(listing.askingPricePerQuintal));
    setOfferQuantity(String(listing.quantityKg));
    setModalVisible(true);
    setToastMessage(null);
  };

  const handleSubmitOffer = async () => {
    if (!offeredPrice || !offerQuantity) {
      alert('Please specify offered price and quantity.');
      return;
    }

    setOfferSubmitting(true);
    try {
      const buyerId = buyerUser?.id || 3;
      const buyerName = buyerUser?.name || 'Kavitha Wholesale Foods';
      const buyerPhone = buyerUser?.phone || '9848012345';
      const buyerRole = buyerUser?.role || 'BUYER';
      const buyerType = buyerRole === 'FPO' ? 'FPO Aggregator' : 'Wholesaler';

      const payload = {
        listingId: activeListing.id,
        farmerId: activeListing.farmerId,
        farmerName: activeListing.farmerName,
        farmerPhone: activeListing.farmerPhone,
        buyerId,
        buyerName,
        buyerPhone,
        buyerType,
        crop: activeListing.crop,
        quantityKg: parseFloat(offerQuantity),
        offeredPricePerQuintal: parseFloat(offeredPrice),
        pickupLocation: activeListing.location,
        deliveryDestination: destination,
        status: 'OFFERED',
      };

      const res = await apiClient.post('/orders/offer', payload);
      if (res.data?.success) {
        setModalVisible(false);
        setToastMessage(`✓ Offer for ${activeListing.crop} submitted! Order #${res.data.data?.orderNumber} created.`);
        loadUserAndListings();
      }
    } catch (err) {
      alert(getFriendlyErrorMessage(err));
    } finally {
      setOfferSubmitting(false);
    }
  };

  const cropFilters = ['ALL', 'Tomato', 'Chilli', 'Rice'];

  return (
    <ScrollView style={styles.container}>
      <NetworkBanner />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.badge}>🛒 DIRECT FARM PROCUREMENT</Text>
          <Text style={styles.title}>Browse Farmer Produce</Text>
          <Text style={styles.subTitle}>Connect directly with farmers to source fresh harvest at competitive rates</Text>
        </View>

        {toastMessage && (
          <View style={styles.toastBox}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {cropFilters.map((cf) => (
            <TouchableOpacity
              key={cf}
              style={[styles.filterPill, selectedCrop === cf && styles.filterPillActive]}
              onPress={() => setSelectedCrop(cf)}
            >
              <Text style={[styles.filterPillText, selectedCrop === cf && styles.filterPillTextActive]}>
                {cf === 'ALL' ? '🌾 All Crops' : cf === 'Tomato' ? '🍅 Tomato' : cf === 'Chilli' ? '🌶️ Chilli' : '🍚 Rice'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 30 }} />
        ) : listings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🌾</Text>
            <Text style={styles.emptyTitle}>No Produce Listed Currently</Text>
            <Text style={styles.emptySub}>Farmers will list their harvest here soon.</Text>
          </View>
        ) : (
          <View style={styles.listingsGrid}>
            {listings.map((l) => (
              <View key={l.id} style={styles.produceCard}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cropTitle}>
                      {l.crop === 'Tomato' ? '🍅' : l.crop === 'Chilli' ? '🌶️' : '🌾'} {l.crop}
                    </Text>
                    <Text style={styles.farmerName}>👨‍🌾 {l.farmerName}</Text>
                    <Text style={styles.location}>📍 {l.location}, {l.district}</Text>
                  </View>

                  <View style={styles.priceBadge}>
                    <Text style={styles.priceLabel}>Asking Rate</Text>
                    <Text style={styles.priceValue}>₹{l.askingPricePerQuintal}</Text>
                    <Text style={styles.priceUnit}>/ quintal</Text>
                  </View>
                </View>

                <View style={styles.quantityBox}>
                  <Text style={styles.quantityText}>
                    Available Lot: <Text style={styles.bold}>{l.quantityKg} kg</Text> ({(l.quantityKg / 100).toFixed(1)} Q)
                  </Text>
                  <Text style={styles.estVal}>
                    Est. Value: ₹{((l.quantityKg / 100) * l.askingPricePerQuintal).toLocaleString()}
                  </Text>
                </View>

                {l.notes ? <Text style={styles.notes}>"{l.notes}"</Text> : null}

                <TouchableOpacity
                  style={styles.offerBtn}
                  onPress={() => openOfferModal(l)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.offerBtnText}>🤝 Make Purchase Offer</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Offer Negotiation Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Make Purchase Offer</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {activeListing && (
              <View style={styles.modalBody}>
                <Text style={styles.modalSub}>
                  Offering for <Text style={styles.bold}>{activeListing.crop}</Text> listed by {activeListing.farmerName}
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Offer Price (₹/Quintal)</Text>
                  <TextInput
                    style={styles.input}
                    value={offeredPrice}
                    onChangeText={setOfferedPrice}
                    keyboardType="numeric"
                    placeholder="e.g. 2750"
                  />
                  <Text style={styles.hint}>Farmer's Asking Price: ₹{activeListing.askingPricePerQuintal}/q</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Quantity to Buy (Kg)</Text>
                  <TextInput
                    style={styles.input}
                    value={offerQuantity}
                    onChangeText={setOfferQuantity}
                    keyboardType="numeric"
                    placeholder="500"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Delivery Destination (Mandi / Processing Center)</Text>
                  <TextInput
                    style={styles.input}
                    value={destination}
                    onChangeText={setDestination}
                    placeholder="e.g. Vijayawada Wholesale APMC"
                  />
                </View>

                <View style={styles.totalCalc}>
                  <Text style={styles.calcLabel}>Estimated Total Order Value:</Text>
                  <Text style={styles.calcValue}>
                    ₹{(
                      ((parseFloat(offerQuantity) || 0) / 100) *
                      (parseFloat(offeredPrice) || 0)
                    ).toLocaleString()}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.submitOfferBtn}
                  onPress={handleSubmitOffer}
                  disabled={offerSubmitting}
                >
                  {offerSubmitting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.submitOfferBtnText}>Send Offer to Farmer →</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    marginBottom: 14,
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
  toastBox: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  toastText: {
    color: '#15803d',
    fontWeight: '700',
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterPillActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#ffffff',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
  },
  listingsGrid: {
    gap: 12,
  },
  produceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
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
  cropTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  farmerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  priceBadge: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#15803d',
  },
  priceUnit: {
    fontSize: 10,
    color: '#64748b',
  },
  quantityBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    marginVertical: 8,
  },
  quantityText: {
    fontSize: 12,
    color: '#334155',
  },
  estVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  notes: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#64748b',
    marginBottom: 10,
  },
  offerBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  offerBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  bold: {
    fontWeight: '700',
    color: '#0f172a',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeBtn: {
    fontSize: 20,
    color: '#64748b',
    padding: 4,
  },
  modalBody: {
    gap: 12,
  },
  modalSub: {
    fontSize: 13,
    color: '#475569',
  },
  inputGroup: {},
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  hint: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#f8fafc',
  },
  totalCalc: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
  },
  calcLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  calcValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#15803d',
  },
  submitOfferBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitOfferBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
