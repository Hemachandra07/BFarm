import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, getFriendlyErrorMessage } from '../api/client';

export const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('farmer123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fillCredentials = (p, pwd) => {
    setPhone(p);
    setPassword(pwd);
    setErrorMessage(null);
  };

  const handleLogin = async () => {
    if (!phone || !password) {
      setErrorMessage('Please enter both mobile number and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.post('/auth/login', { phone, password });
      if (res.data?.success && res.data?.data) {
        const authData = res.data.data;
        await AsyncStorage.setItem('@bfarm_auth_token', authData.token);
        await AsyncStorage.setItem('@bfarm_role', authData.role);
        await AsyncStorage.setItem('@bfarm_user_info', JSON.stringify(authData));
        if (authData.role === 'ADMIN' && Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.href = '/admin/index.html';
          return;
        }
        navigation.replace('MainTabs');
      } else {
        setErrorMessage(res.data?.message || 'Login failed.');
      }
    } catch (err) {
      // Fallback offline mock logins for all demo accounts if network unreachable
      const mockRoles = {
        '9876543210': { id: 1, name: 'Ramesh Kumar (Farmer)', role: 'FARMER', district: 'Guntur' },
        '9848012345': { id: 3, name: 'Kavitha Wholesale Foods', role: 'BUYER', district: 'Krishna' },
        '8632255443': { id: 4, name: 'Guntur Rythu Mitra FPO', role: 'FPO', district: 'Guntur' },
        '8632311223': { id: 5, name: 'Krishna Cold Storage Ltd', role: 'STORAGE_PROVIDER', district: 'Guntur' },
        '9848111222': { id: 6, name: 'Sri Balaji Farm Logistics', role: 'LOGISTICS_PROVIDER', district: 'Guntur' },
        '9999999999': { id: 2, name: 'AgriCare Admin', role: 'ADMIN', district: 'Guntur' },
      };

      if (mockRoles[phone]) {
        const user = { ...mockRoles[phone], phone, token: 'mock-token' };
        await AsyncStorage.setItem('@bfarm_auth_token', 'mock-token');
        await AsyncStorage.setItem('@bfarm_role', user.role);
        await AsyncStorage.setItem('@bfarm_user_info', JSON.stringify(user));
        if (user.role === 'ADMIN' && Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.href = '/admin/index.html';
          return;
        }
        navigation.replace('MainTabs');
        return;
      }

      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollWrapper} contentContainerStyle={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarIcon}>🌾</Text>
        </View>
        <Text style={styles.appTitle}>BFarm</Text>
        <Text style={styles.screenHeading}>Smart Crop Care & Direct Farmgate Market</Text>
      </View>

      <View style={styles.formCard}>
        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('phoneNumber') || 'Mobile Phone Number'}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 9876543210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={15}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('password') || 'Password'}</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#94a3b8"
          />
        </View>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.loginBtnText}>{t('login') || 'Sign In'} →</Text>
          )}
        </TouchableOpacity>

        {/* 1-Click Role Access Buttons */}
        <View style={styles.demoSection}>
          <Text style={styles.demoHeading}>⚡ Quick Role Login (1-Click Fill):</Text>
          
          <View style={styles.demoGrid}>
            <TouchableOpacity 
              style={[styles.roleBtn, phone === '9876543210' && styles.roleBtnActive]} 
              onPress={() => fillCredentials('9876543210', 'farmer123')}
            >
              <Text style={styles.roleBtnIcon}>👨‍🌾</Text>
              <Text style={styles.roleBtnTitle}>Farmer</Text>
              <Text style={styles.roleBtnSub}>Ramesh Kumar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleBtn, phone === '9848012345' && styles.roleBtnActive]} 
              onPress={() => fillCredentials('9848012345', 'buyer123')}
            >
              <Text style={styles.roleBtnIcon}>🏢</Text>
              <Text style={styles.roleBtnTitle}>Buyer</Text>
              <Text style={styles.roleBtnSub}>Kavitha Traders</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleBtn, phone === '8632255443' && styles.roleBtnActive]} 
              onPress={() => fillCredentials('8632255443', 'fpo123')}
            >
              <Text style={styles.roleBtnIcon}>🤝</Text>
              <Text style={styles.roleBtnTitle}>FPO</Text>
              <Text style={styles.roleBtnSub}>Rythu Mitra</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleBtn, phone === '8632311223' && styles.roleBtnActive]} 
              onPress={() => fillCredentials('8632311223', 'storage123')}
            >
              <Text style={styles.roleBtnIcon}>❄️</Text>
              <Text style={styles.roleBtnTitle}>Cold Storage</Text>
              <Text style={styles.roleBtnSub}>Krishna Storage</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleBtn, phone === '9848111222' && styles.roleBtnActive]} 
              onPress={() => fillCredentials('9848111222', 'trans123')}
            >
              <Text style={styles.roleBtnIcon}>🚚</Text>
              <Text style={styles.roleBtnTitle}>Logistics</Text>
              <Text style={styles.roleBtnSub}>Balaji Express</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleBtn, styles.adminRoleBtn, phone === '9999999999' && styles.roleBtnActive]} 
              onPress={() => fillCredentials('9999999999', 'admin123')}
            >
              <Text style={styles.roleBtnIcon}>🛡️</Text>
              <Text style={styles.roleBtnTitle}>Admin</Text>
              <Text style={styles.roleBtnSub}>Command Center</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Register CTA */}
        <View style={styles.registerBlock}>
          <Text style={styles.registerPrompt}>Don't have an account yet?</Text>
          <TouchableOpacity 
            style={styles.registerBtn}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.85}
          >
            <Text style={styles.registerBtnText}>✨ Register New Account (All Roles)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 20,
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 40,
    minHeight: '100%',
  },
  topSection: {
    alignItems: 'center',
    marginTop: 12,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  avatarIcon: {
    fontSize: 34,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#15803d',
    letterSpacing: -0.5,
  },
  screenHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    gap: 14,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '700',
  },
  inputGroup: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  loginBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    marginTop: 4,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  demoSection: {
    marginTop: 6,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  demoHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleBtn: {
    width: '31%',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  roleBtnActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  adminRoleBtn: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  roleBtnIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  roleBtnTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  roleBtnSub: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 1,
    textAlign: 'center',
  },
  registerBlock: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 6,
  },
  registerPrompt: {
    fontSize: 13,
    color: '#64748b',
  },
  registerBtn: {
    backgroundColor: '#eff6ff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    width: '100%',
    alignItems: 'center',
  },
  registerBtnText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '800',
  },
});
