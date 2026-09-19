import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, getFriendlyErrorMessage } from '../api/client';
import { NetworkBanner } from '../components/NetworkBanner';

export const BuyerOrdersScreen = ({ navigation }) => {
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
      const buyerId = u?.id || 3;

      const res = await apiClient.get(`/orders/buyer/${buyerId}`);
      if (res.data?.success && res.data?.data) {
        setOrders(res.data.data);
      }
    } catch (e) {
      console.warn('Failed to fetch buyer orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBookTransport = async (order) => {
    setActionLoadingId(order.id);
    setStatusMessage(null);
    try {
      // 1. Submit logistics request
      const logPayload = {
        farmerId: order.farmerId,
        providerId: 1,
        providerName: 'Sri Balaji Farm Logistics',
        pickupLocation: order.pickupLocation || 'Tenali Farm Gate, Guntur',
        destination: order.deliveryDestination || 'Vijayawada Wholesale APMC',
        crop: order.crop,
        quantity: order.quantityKg,
        estimatedCost: 1500.0,
        farmerPhone: order.farmerPhone,
        notes: `Produce Order #${order.orderNumber}`,
      };

      const logRes = await apiClient.post('/logistics/request', logPayload);
      const refNum = logRes.data?.data?.referenceNumber || 'AC-2026-00450';

      // 2. Update order status to LOGISTICS_BOOKED
      await apiClient.put(`/orders/${order.id}/status?status=LOGISTICS_BOOKED&logisticsRef=${refNum}`);

      setStatusMessage(`✓ Logistics booked with ${refNum}! Mini truck scheduled for farmgate pickup.`);
      fetchOrders();
    } catch (err) {
      setStatusMessage(getFriendlyErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmDelivery = async (orderId) => {
    setActionLoadingId(orderId);
    setStatusMessage(null);
    try {
      await apiClient.put(`/orders/${orderId}/status?status=DELIVERED`);
      setStatusMessage('✓ Delivery confirmed! Transaction completed successfully.');
      fetchOrders();
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
          <Text style={styles.badge}>📦 PROCUREMENT & LOGISTICS</Text>
          <Text style={styles.title}>My Purchase Orders</Text>
          <Text style={styles.subTitle}>Track submitted offers, coordinate farmgate logistics, and confirm delivery</Text>
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
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySub}>Browse farmer produce and send purchase offers to start direct procurement.</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('BrowseProduce')}>
              <Text style={styles.browseBtnText}>Browse Farmer Listings →</Text>
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

                <View style={styles.farmerBox}>
                  <Text style={styles.farmerName}>👨‍🌾 Farmer: {o.farmerName}</Text>
                  <Text style={styles.farmerPhone}>📞 {o.farmerPhone} • 📍 Pickup: {o.pickupLocation}</Text>
                  <Text style={styles.destination}>🏁 Delivery: {o.deliveryDestination}</Text>
                </View>

                <View style={styles.priceRow}>
                  <View style={styles.priceCol}>
                    <Text style={styles.priceLabel}>Quantity</Text>
                    <Text style={styles.priceVal}>{o.quantityKg} kg</Text>
                  </View>
                  <View style={styles.priceCol}>
                    <Text style={styles.priceLabel}>Offered Rate</Text>
                    <Text style={styles.priceValGreen}>₹{o.offeredPricePerQuintal} / q</Text>
                  </View>
                  <View style={styles.priceCol}>
                    <Text style={styles.priceLabel}>Total Amount</Text>
                    <Text style={styles.priceValBold}>₹{o.totalAmount?.toLocaleString()}</Text>
                  </View>
                </View>

                {o.logisticsReference && (
                  <View style={styles.logisticsBox}>
                    <Text style={styles.logisticsTitle}>🚚 Transport Assigned</Text>
                    <Text style={styles.logisticsSub}>Booking Reference: <Text style={styles.bold}>{o.logisticsReference}</Text></Text>
                  </View>
                )}

                {/* Role Actions based on status */}
                {o.status === 'OFFERED' && (
                  <View style={styles.waitingBanner}>
                    <Text style={styles.waitingText}>⏳ Awaiting farmer review and acceptance</Text>
                  </View>
                )}

                {o.status === 'ACCEPTED' && (
                  <TouchableOpacity
                    style={styles.bookTransportBtn}
                    onPress={() => handleBookTransport(o)}
                    disabled={actionLoadingId === o.id}
                  >
                    {actionLoadingId === o.id ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text style={styles.bookTransportBtnText}>🚚 Arrange Farmgate Transport</Text>
                    )}
                  </TouchableOpacity>
                )}

                {(o.status === 'LOGISTICS_BOOKED' || o.status === 'IN_TRANSIT') && (
                  <TouchableOpacity
                    style={styles.confirmDeliveryBtn}
                    onPress={() => handleConfirmDelivery(o.id)}
                    disabled={actionLoadingId === o.id}
                  >
                    {actionLoadingId === o.id ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text style={styles.confirmDeliveryBtnText}>✓ Confirm Delivery Received</Text>
                    )}
                  </TouchableOpacity>
                )}

                {o.status === 'DELIVERED' && (
                  <View style={styles.deliveredBanner}>
                    <Text style={styles.deliveredText}>✅ Produce Delivered & Verified</Text>
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
    marginVertical: 10,
  },
  browseBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  browseBtnText: {
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
  status_LOGISTICS_BOOKED: {
    backgroundColor: '#e0f2fe',
  },
  status_IN_TRANSIT: {
    backgroundColor: '#fed7aa',
  },
  status_DELIVERED: {
    backgroundColor: '#bbf7d0',
  },
  status_REJECTED: {
    backgroundColor: '#fee2e2',
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a',
  },
  farmerBox: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  farmerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  farmerPhone: {
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
  logisticsBox: {
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  logisticsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  logisticsSub: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 2,
  },
  waitingBanner: {
    backgroundColor: '#fffbeb',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  waitingText: {
    color: '#b45309',
    fontSize: 12,
    fontWeight: '700',
  },
  bookTransportBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookTransportBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  confirmDeliveryBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmDeliveryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  deliveredBanner: {
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deliveredText: {
    color: '#15803d',
    fontSize: 13,
    fontWeight: '700',
  },
  bold: {
    fontWeight: '700',
    color: '#0f172a',
  },
});
