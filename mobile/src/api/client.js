import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api`;
  }

  // Automatically extract host machine IP when running on physical device via Expo
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp) {
      return `http://${hostIp}:8080/api`;
    }
  }

  // Fallback to your host machine's Wi-Fi LAN IP (works for physical phones on same Wi-Fi)
  return 'http://10.142.28.128:8080/api';
};

export const API_BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('@bfarm_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // Ignore error
  }
  return config;
});

export const getFriendlyErrorMessage = (error) => {
  if (!error) return 'An unexpected issue occurred. Please try again.';
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message?.includes('Network Error') || error.code === 'ECONNABORTED') {
    return 'No internet connection. Saved to local device.';
  }
  return 'Unable to complete request. Please try again.';
};
