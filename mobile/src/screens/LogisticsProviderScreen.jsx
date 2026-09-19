import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, getFriendlyErrorMessage } from '../api/client';
import { NetworkBanner } from '../components/NetworkBanner';

export const LogisticsProviderScreen = () => {
  const [providerData, setProviderData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    loadLogisticsData();
  }, []);

  const loadLogisticsData = async () => {
    setLoading(true);
    try {
      // Get primary logistics provider
      const pRes = await apiClient.get('/logistics');
      if (pRes.data?.success && pRes.data?.data && pRes.data.data.length > 0) {
        setProviderData(pRes.data.data[0]);
      }

      // Get all logistics requests
      const rRes = await apiClient.get('/logistics/requests');
      if (rRes.data?.success && rRes.data?.data) {
        setRequests(rRes.data.data);
      }
    } catch (e) {
      console.warn('Failed to load logistics provider info:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, nextStatus) => {
    setActionLoadingId(requestId);
    setStatusMessage(null);
    try {
      const res = await apiClient.put(`/logistics/requests/${requestId}/status?status=${nextStatus}`);
      if (res.data?.success) {
        setStatusMessage(`✓ Shipment status updated to ${nextStatus}!`);
        loadLogisticsData();
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
          <Text style={styles.badge}>🚚 FLEET & RURAL TRANSPORT</Text>
          <Text style={styles.title}>Logistics Command Hub</Text>
          <Text style={styles.subTitle}>Manage farmgate pickup fleet, accept transportation jobs, and track live transit</Text>
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
            {/* Fleet Overview Card */}
            <View style={styles.fleetCard}>
              <View style={styles.fleetTop}>
                <Text style={styles.providerName}>🚚 {providerData?.name || 'Sri Balaji Farm Logistics'}</Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified Fleet</Text>
                </View>
              </View>

              <Text style={styles.fleetLoc}>📍 Base: {providerData?.location || 'Tenali'}, {providerData?.district || 'Guntur'}</Text>

              <View style={styles.fleetMetrics}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Vehicle Type</Text>
                  <Text style={styles.metricVal}>{providerData?.vehicleType || 'Mini Truck (Tata Ace)'}</Text>
                </View>

                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Payload Capacity</Text>
                  <Text style={styles.metricVal}>{providerData?.capacity || 1.0} Ton</Text>
                </View>

                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Rate / Km</Text>
                  <Text style={styles.metricValGreen}>₹{providerData?.ratePerKm || 25}/km</Text>
                </View>
              </View>
            </View>

            {/* Transport Requests Feed */}
            <View style={styles.jobsSection}>
              <Text style={styles.sectionHeader}>Active Transportation Jobs ({requests.length})</Text>

              {requests.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyIcon}>🚚</Text>
                  <Text style={styles.emptyTitle}>No Pending Transportation Jobs</Text>
                  <Text style={styles.emptySub}>Farmer and buyer shipment bookings will show up here.</Text>
                </View>
              ) : (
                requests.map((req) => (
                  <View key={req.id} style={styles.jobCard}>
                    <View style={styles.jobTop}>
                      <View>
                        <Text style={styles.jobCrop}>
                          {req.crop === 'Tomato' ? '🍅' : req.crop === 'Chilli' ? '🌶️' : '🌾'} {req.crop} ({req.quantity} kg)
                        </Text>
                        <Text style={styles.refNum}>Ref #{req.referenceNumber}</Text>
                      </View>

                      <View style={[styles.statusTag, styles[`status_${req.status}`]]}>
                        <Text style={styles.statusTagText}>{req.status}</Text>
                      </View>
                    </View>

                    <View style={styles.routeBox}>
                      <Text style={styles.routePoint}>🟢 <Text style={styles.bold}>Pickup:</Text> {req.pickupLocation}</Text>
                      <Text style={styles.routePoint}>🏁 <Text style={styles.bold}>Destination:</Text> {req.destination}</Text>
                      {req.farmerPhone && <Text style={styles.routeContact}>📞 Contact: {req.farmerPhone}</Text>}
                    </View>

                    <View style={styles.fareRow}>
                      <Text style={styles.fareLabel}>Trip Fare:</Text>
                      <Text style={styles.fareVal}>₹{req.estimatedCost?.toLocaleString()}</Text>
                    </View>

                    {req.notes && <Text style={styles.jobNotes}>"{req.notes}"</Text>}

                    {/* Action buttons for status progression */}
                    <View style={styles.actionContainer}>
                      {req.status === 'PENDING' && (
                        <TouchableOpacity
                          style={styles.confirmBtn}
                          onPress={() => handleUpdateStatus(req.id, 'CONFIRMED')}
                          disabled={actionLoadingId === req.id}
                        >
                          <Text style={styles.btnText}>✓ Accept Job & Assign Vehicle</Text>
                        </TouchableOpacity>
                      )}

                      {req.status === 'CONFIRMED' && (
                        <TouchableOpacity
                          style={styles.transitBtn}
                          onPress={() => handleUpdateStatus(req.id, 'IN_TRANSIT')}
                          disabled={actionLoadingId === req.id}
                        >
                          <Text style={styles.btnText}>🚚 Start Farmgate Pickup (In Transit)</Text>
                        </TouchableOpacity>
                      )}

                      {req.status === 'IN_TRANSIT' && (
                        <TouchableOpacity
                          style={styles.completeBtn}
                          onPress={() => handleUpdateStatus(req.id, 'COMPLETED')}
                          disabled={actionLoadingId === req.id}
                        >
                          <Text style={styles.btnText}>✅ Mark Delivery Completed</Text>
                        </TouchableOpacity>
                      )}

                      {req.status === 'COMPLETED' && (
                        <View style={styles.completedTag}>
                          <Text style={styles.completedTagText}>🎉 Job Successfully Completed</Text>
                        </View>
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
    color: '#d97706',
    backgroundColor: '#fef3c7',
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
  fleetCard: {
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
  fleetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 17,
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
  fleetLoc: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  fleetMetrics: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textAlign: 'center',
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 3,
    textAlign: 'center',
  },
  metricValGreen: {
    fontSize: 14,
    fontWeight: '900',
    color: '#15803d',
    marginTop: 3,
  },
  jobsSection: {
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
  jobCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  jobTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobCrop: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  refNum: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  statusTag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  status_PENDING: {
    backgroundColor: '#fef3c7',
  },
  status_CONFIRMED: {
    backgroundColor: '#dbeafe',
  },
  status_IN_TRANSIT: {
    backgroundColor: '#fed7aa',
  },
  status_COMPLETED: {
    backgroundColor: '#dcfce7',
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f172a',
  },
  routeBox: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    gap: 4,
    marginBottom: 8,
  },
  routePoint: {
    fontSize: 12,
    color: '#334155',
  },
  routeContact: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600',
    marginTop: 2,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 8,
  },
  fareLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  fareVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#15803d',
  },
  jobNotes: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#64748b',
    marginBottom: 10,
  },
  actionContainer: {
    marginTop: 4,
  },
  confirmBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  transitBtn: {
    backgroundColor: '#ea580c',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  completedTag: {
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedTagText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: '700',
  },
  bold: {
    fontWeight: '700',
    color: '#0f172a',
  },
});
