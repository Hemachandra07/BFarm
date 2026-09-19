import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, getFriendlyErrorMessage } from '../api/client';
import { NetworkBanner } from '../components/NetworkBanner';

export const FarmerOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('@bfarm_user_info');
      const u = stored ? JSON.parse(stored) : null;
      const farmerId = u?.id || 1;

      const res = await apiClient.get(`/orders/farmer/${farmerId}`);
      if (res.data?.success && res.data?.data) {
        setOrders(res.data.data);
      }
    } catch (e) {
      console.warn('Failed to fetch farmer orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (orderId) => {
    setActionLoadingId(orderId);
    setStatusMessage(null);
    try {
      const res = await apiClient.post(`/orders/${orderId}/accept`);
      if (res.data?.success) {
        setStatusMessage('✓ Offer accepted! Order created. Buyer is notified to arrange transport.');
        fetchOrders();
      }
    } catch (err) {
      setStatusMessage(getFriendlyErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (orderId) => {
    setActionLoadingId(orderId);
    setStatusMessage(null);
    try {
      const res = await apiClient.post(`/orders/${orderId}/reject`);
      if (res.data?.success) {
        setStatusMessage('Offer rejected. Listing remains open for other buyers.');
        fetchOrders();
      }
    } catch (err) {
      setStatusMessage(getFriendlyErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <NetworkBanner />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.badge}>🤝 BUYER & FPO OFFERS</Text>
          <Text style={styles.title}>Received Purchase Offers</Text>
          <Text style={styles.subTitle}>Review offers submitted by verified buyers and direct procurement partners</Text>
        </View>

        {statusMessage && (
          <View style={[styles.statusBox, statusMessage.startsWith('✓') ? styles.statusSuccess : styles.statusError]}>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 30 }} />
        ) : orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📬</Text>
            <Text style={styles.emptyTitle}>No Purchase Offers Yet</Text>
            <Text style={styles.emptySub}>When buyers make an offer on your produce listings, they will appear here for your review.</Text>
            <TouchableOpacity style={styles.listProduceBtn} onPress={() => navigation.navigate('ProduceListing')}>
              <Text style={styles.listProduceText}>+ List New Produce for Sale</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((o) => (
              <View key={o.id} style={styles.orderCard}>
                <View style={styles.orderTop}>
                  <View>
                    <Text style={styles.orderCrop}>{o.crop === 'Tomato' ? '🍅' : o.crop === 'Chilli' ? '🌶️' : '🌾'} {o.crop}</Text>
                    <Text style={styles.orderNum}>Order #{o.orderNumber}</Text>
                  </View>

                  <View style={[styles.statusTag, styles[`status_${o.status}`]]}>
                    <Text style={styles.statusTagText}>{o.status}</Text>
                  </View>
                </View>

                <View style={styles.buyerInfoBox}>
                  <Text style={styles.buyerName}>🏢 {o.buyerName}</Text>
                  <Text style={styles.buyerType}>{o.buyerType || 'Verified Trader'} • 📞 {o.buyerPhone}</Text>
                  <Text style={styles.destination}>📍 Delivery APMC: {o.deliveryDestination}</Text>
                </View>

                <View style={styles.priceRow}>
                  <View style={styles.priceCol}>
                    <Text style={styles.priceLabel}>Quantity</Text>
                    <Text style={styles.priceVal}>{o.quantityKg} kg</Text>
                  </View>
                  <View style={styles.priceCol}>
                    <Text style={styles.priceLabel}>Offered Price</Text>
                    <Text style={styles.priceValGreen}>₹{o.offeredPricePerQuintal} / q</Text>
                  </View>
                  <View style={styles.priceCol}>
                    <Text style={styles.priceLabel}>Total Value</Text>
                    <Text style={styles.priceValBold}>₹{o.totalAmount?.toLocaleString()}</Text>
                  </View>
                </View>

                {o.logisticsReference && (
                  <View style={styles.logisticsNotice}>
                    <Text style={styles.logisticsNoticeText}>🚚 Logistics Arranged: Reference {o.logisticsReference}</Text>
                  </View>
                )}

                {o.status === 'OFFERED' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => handleAccept(o.id)}
                      disabled={actionLoadingId === o.id}
                    >
                      {actionLoadingId === o.id ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                      ) : (
                        <Text style={styles.acceptBtnText}>✓ Accept Offer</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleReject(o.id)}
                      disabled={actionLoadingId === o.id}
                    >
                      <Text style={styles.rejectBtnText}>✕ Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {o.status === 'ACCEPTED' && (
                  <View style={styles.acceptedBanner}>
                    <Text style={styles.acceptedText}>✓ You accepted this offer. Buyer is arranging transport.</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
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
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 18,
  },
  listProduceBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  listProduceText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  ordersList: {
    gap: 14,
  },
  orderCard: {
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
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderCrop: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  orderNum: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  statusTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  status_OFFERED: {
    backgroundColor: '#fef3c7',
  },
  status_ACCEPTED: {
    backgroundColor: '#dcfce7',
  },
  status_REJECTED: {
    backgroundColor: '#fee2e2',
  },
  status_DELIVERED: {
    backgroundColor: '#dbeafe',
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a',
  },
  buyerInfoBox: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  buyerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  buyerType: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  destination: {
    fontSize: 12,
    color: '#475569',
    marginTop: 3,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 12,
  },
  priceCol: {},
  priceLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  priceVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  priceValGreen: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803d',
    marginTop: 2,
  },
  priceValBold: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  logisticsNotice: {
    backgroundColor: '#eff6ff',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  logisticsNoticeText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  acceptBtn: {
    flex: 2,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },
  acceptedBanner: {
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptedText: {
    color: '#15803d',
    fontSize: 13,
    fontWeight: '700',
  },
});
