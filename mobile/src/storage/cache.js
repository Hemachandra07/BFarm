import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  DIAGNOSIS_HISTORY: '@bfarm_cache_diagnoses',
  MARKET_PRICES: '@bfarm_cache_market_prices',
  BUYERS: '@bfarm_cache_buyers',
  FPOS: '@bfarm_cache_fpos',
  COLD_STORAGE: '@bfarm_cache_cold_storage',
  LOGISTICS: '@bfarm_cache_logistics',
  LAST_DIAGNOSIS: '@bfarm_cache_last_diagnosis',
};

export const saveCache = async (key, data) => {
  try {
    const storageKey = CACHE_KEYS[key] || `@bfarm_cache_${key}`;
    await AsyncStorage.setItem(storageKey, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save cache for ' + key, e);
  }
};

export const loadCache = async (key) => {
  try {
    const storageKey = CACHE_KEYS[key] || `@bfarm_cache_${key}`;
    const raw = await AsyncStorage.getItem(storageKey);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load cache for ' + key, e);
  }
  return null;
};
