import { apiClient } from '../api/client';
import { getPendingRequests, removeOfflineRequests } from '../storage/offlineQueue';

export const syncOfflineDataWithServer = async (userId = 1) => {
  const pending = await getPendingRequests();
  if (pending.length === 0) {
    return { success: true, count: 0, message: 'Everything is up to date.' };
  }

  try {
    const formattedPayload = {
      userId,
      pendingRequests: pending.map((item) => ({
        clientRequestId: item.id,
        type: item.type,
        payload: JSON.stringify(item.payload),
        createdAtTimestamp: item.createdAt,
      })),
    };

    const res = await apiClient.post('/sync/batch', formattedPayload);
    if (res.data?.success) {
      const syncedIds = (res.data.data?.results || [])
        .filter((r) => r.status === 'SYNCED' || r.status === 'SKIPPED_DUPLICATE')
        .map((r) => r.clientRequestId);

      if (syncedIds.length > 0) {
        await removeOfflineRequests(syncedIds);
      }

      return {
        success: true,
        count: syncedIds.length,
        message: `✓ ${syncedIds.length} item(s) synchronized with central server`,
      };
    }
    return { success: false, count: 0, message: 'Server did not acknowledge sync.' };
  } catch (err) {
    console.warn('Sync failed (offline or network error):', err.message);
    return {
      success: false,
      count: 0,
      message: 'Still offline. Data is safely stored on your device.',
    };
  }
};
