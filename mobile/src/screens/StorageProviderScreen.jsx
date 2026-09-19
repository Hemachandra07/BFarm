import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, getFriendlyErrorMessage } from '../api/client';
import { NetworkBanner } from '../components/NetworkBanner';

export const StorageProviderScreen = () => {
  const [storageData, setStorageData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCapacity, setNewCapacity] = useState('');
  const [updatingCapacity, setUpdatingCapacity] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    loadFacilityData();
  }, []);

  const loadFacilityData = async () => {
    setLoading(true);
    try {
      // Fetch primary cold storage
      const res = await apiClient.get('/storage');
      if (res.data?.success && res.data?.data && res.data.data.length > 0) {
        const facility = res.data.data[0];
        setStorageData(facility);
        setNewCapacity(String(facility.availableCapacity || 1850));

        // Fetch bookings for this storage
        const bRes = await apiClient.get(`/storage/bookings/storage/${facility.id}`);
        if (bRes.data?.success && bRes.data?.data) {
          setBookings(bRes.data.data);
        }
      }
    } catch (e) {
      console.warn('Failed to load storage facility:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCapacity = async () => {
    if (!newCapacity || isNaN(parseFloat(newCapacity))) {
      setStatusMessage('Please enter a valid numeric capacity.');
      return;
    }

    setUpdatingCapacity(true);
    setStatusMessage(null);
    try {
      const facilityId = storageData?.id || 1;
      const res = await apiClient.put(`/storage/${facilityId}/capacity?availableCapacity=${parseFloat(newCapacity)}`);
      if (res.data?.success) {
        setStatusMessage('✓ Available cold storage capacity updated!');
        loadFacilityData();
      }
    } catch (err) {
      setStatusMessage(getFriendlyErrorMessage(err));
    } finally {
      setUpdatingCapacity(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await apiClient.put(`/storage/bookings/${bookingId}/status?status=${newStatus}`);
      if (res.data?.success) {
        setStatusMessage(`✓ Booking status updated to ${newStatus}`);
        loadFacilityData();
      }
    } catch (err) {
      setStatusMessage(getFriendlyErrorMessage(err));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <NetworkBanner />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.badge}>❄️ WAREHOUSE & PRESERVATION</Text>
          <Text style={styles.title}>Cold Storage Management</Text>
          <Text style={styles.subTitle}>Manage facility capacity, monitor preservation chambers, and handle farmer reservations</Text>
        </View>

        {statusMessage && (
          <View style={[styles.statusBox, statusMessage.startsWith('✓') ? styles.statusSuccess : styles.statusError]}>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 30 }} />
        ) : (
          <>
            {/* Facility Card */}
            <View style={styles.facilityCard}>
              <View style={styles.cardTop}>
                <Text style={styles.facilityName}>🏢 {storageData?.name || 'Krishna Cold Storage'}</Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Certified Facility</Text>
                </View>
              </View>

              <Text style={styles.locText}>📍 {storageData?.location}, {storageData?.district}</Text>
              <Text style={styles.cropsText}>Supported: {storageData?.supportedCrops || 'Chilli, Tomato, Potato, Vegetables'}</Text>

              <View style={styles.capacityMetricRow}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Total Capacity</Text>
                  <Text style={styles.metricVal}>{storageData?.capacity || 5000} MT</Text>
                </View>

                <View style={[styles.metricBox, styles.metricBoxGreen]}>
                  <Text style={styles.metricLabelGreen}>Available Space</Text>
                  <Text style={styles.metricValGreen}>{storageData?.availableCapacity || 1850} MT</Text>
                </View>

                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Daily Rate</Text>
                  <Text style={styles.metricVal}>₹{storageData?.pricePerDay || 45}/bag</Text>
                </View>
              </View>

              {/* Capacity Update Input */}
              <View style={styles.updateRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.updateLabel}>Adjust Available Capacity (MT):</Text>
                  <TextInput
                    style={styles.capacityInput}
                    value={newCapacity}
                    onChangeText={setNewCapacity}
                    keyboardType="numeric"
                  />
                </View>

                <TouchableOpacity
                  style={styles.updateBtn}
                  onPress={handleUpdateCapacity}
                  disabled={updatingCapacity}
                >
                  {updatingCapacity ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.updateBtnText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Inbound Storage Bookings */}
            <View style={styles.bookingsSection}>
              <Text style={styles.sectionHeader}>Inbound Farmer Reservations ({bookings.length})</Text>

              {bookings.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyIcon}>📦</Text>
                  <Text style={styles.emptyTitle}>No Pending Bookings</Text>
                  <Text style={styles.emptySub}>Farmer storage reservations will appear here.</Text>
                </View>
              ) : (
                bookings.map((b) => (
                  <View key={b.id} style={styles.bookingCard}>
                    <View style={styles.bookingTop}>
                      <View>
                        <Text style={styles.bookingCrop}>
                          {b.crop === 'Tomato' ? '🍅' : b.crop === 'Chilli' ? '🌶️' : '🥔'} {b.crop}
                        </Text>
                        <Text style={styles.bookingNum}>Ref #{b.bookingNumber}</Text>
                      </View>

                      <View style={[styles.statusBadge, styles[`bstatus_${b.status}`]]}>
                        <Text style={styles.statusBadgeText}>{b.status}</Text>
                      </View>
                    </View>

                    <Text style={styles.farmerLine}>👨‍🌾 {b.userName} • 📞 {b.userPhone}</Text>
                    <Text style={styles.detailLine}>Reserved Space: <Text style={styles.bold}>{b.quantityMt} MT</Text> for {b.durationDays || 30} days</Text>
                    <Text style={styles.estCost}>Estimated Revenue: ₹{b.estimatedCost?.toLocaleString()}</Text>

                    {b.notes && <Text style={styles.bNotes}>"{b.notes}"</Text>}

                    <View style={styles.bookingActions}>
                      {b.status === 'REQUESTED' && (
                        <>
                          <TouchableOpacity
                            style={styles.approveBtn}
                            onPress={() => handleUpdateBookingStatus(b.id, 'APPROVED')}
                          >
                            <Text style={styles.approveText}>✓ Approve Reservation</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.rejectBtn}
                            onPress={() => handleUpdateBookingStatus(b.id, 'REJECTED')}
                          >
                            <Text style={styles.rejectText}>✕ Decline</Text>
                          </TouchableOpacity>
                        </>
                      )}

                      {b.status === 'APPROVED' && (
                        <TouchableOpacity
                          style={styles.storedBtn}
                          onPress={() => handleUpdateBookingStatus(b.id, 'STORED')}
                        >
                          <Text style={styles.storedText}>📦 Mark Produce Stored in Chamber</Text>
                        </TouchableOpacity>
                      )}

                      {b.status === 'STORED' && (
                        <TouchableOpacity
                          style={styles.releaseBtn}
                          onPress={() => handleUpdateBookingStatus(b.id, 'RELEASED')}
                        >
                          <Text style={styles.releaseText}>🚚 Release Produce for Dispatch</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
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
    color: '#0284c7',
    backgroundColor: '#e0f2fe',
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
  facilityCard: {
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  locText: {
    fontSize: 13,
    color: '#64748b',
  },
  cropsText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
    marginBottom: 12,
  },
  capacityMetricRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  metricBoxGreen: {
    backgroundColor: '#dcfce7',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  metricLabelGreen: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  metricValGreen: {
    fontSize: 15,
    fontWeight: '900',
    color: '#15803d',
    marginTop: 2,
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    paddingTop: 12,
  },
  updateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  capacityInput: {
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    backgroundColor: '#f8fafc',
  },
  updateBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  updateBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  bookingsSection: {
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    padding: 24,
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
  bookingCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  bookingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bookingCrop: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  bookingNum: {
    fontSize: 11,
    color: '#64748b',
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  bstatus_REQUESTED: {
    backgroundColor: '#fef3c7',
  },
  bstatus_APPROVED: {
    backgroundColor: '#dcfce7',
  },
  bstatus_STORED: {
    backgroundColor: '#dbeafe',
  },
  bstatus_RELEASED: {
    backgroundColor: '#f1f5f9',
  },
  bstatus_REJECTED: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f172a',
  },
  farmerLine: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  detailLine: {
    fontSize: 12,
    color: '#475569',
  },
  estCost: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16a34a',
    marginTop: 3,
  },
  bNotes: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#64748b',
    marginTop: 4,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  approveBtn: {
    flex: 2,
    backgroundColor: '#16a34a',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#fee2e2',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '700',
  },
  storedBtn: {
    flex: 1,
    backgroundColor: '#0284c7',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  storedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  releaseBtn: {
    flex: 1,
    backgroundColor: '#475569',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  releaseText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  bold: {
    fontWeight: '700',
    color: '#0f172a',
  },
});
