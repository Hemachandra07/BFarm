import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@bfarm_offline_queue';

export const enqueueOfflineRequest = async (type, payload) => {
  const newRequest = {
    id: 'off-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    type,
    payload,
    createdAt: Date.now(),
    syncStatus: 'PENDING',
  };

  try {
    const queue = await getPendingRequests();
    queue.push(newRequest);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to enqueue offline request', e);
  }

  return newRequest;
};

export const getPendingRequests = async () => {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to get offline queue', e);
  }
  return [];
};

export const removeOfflineRequests = async (idsToRemove) => {
  try {
    const queue = await getPendingRequests();
    const filtered = queue.filter((item) => !idsToRemove.includes(item.id));
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to prune offline queue', e);
  }
};

export const clearOfflineQueue = async () => {
  await AsyncStorage.removeItem(QUEUE_KEY);
};
