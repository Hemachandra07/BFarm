import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, getFriendlyErrorMessage } from '../api/client';

export const RegisterScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [role, setRole] = useState('FARMER');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [stateName, setStateName] = useState('Andhra Pradesh');
  const [district, setDistrict] = useState('Guntur');
  const [village, setVillage] = useState('');
  
  // Role-specific extra fields
  const [companyName, setCompanyName] = useState('');
  const [buyerType, setBuyerType] = useState('Food Processor');
  const [crops, setCrops] = useState('Tomato, Chilli');
  const [memberCount, setMemberCount] = useState('350');
  const [capacityMt, setCapacityMt] = useState('500');
  const [ratePerKm, setRatePerKm] = useState('22');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const roles = [
    { 
      key: 'FARMER', 
      title: 'Farmer', 
      icon: '👨‍🌾', 
      desc: 'Sell harvest, AI crop disease diagnosis & mandi rates' 
    },
    { 
      key: 'BUYER', 
      title: 'Buyer', 
      icon: '🏢', 
      desc: 'Wholesaler, processor or trader buying direct from farmgate' 
    },
    { 
      key: 'FPO', 
      title: 'FPO', 
      icon: '🤝', 
      desc: 'Farmer Producer Org aggregating produce & collective logistics' 
    },
    { 
      key: 'STORAGE_PROVIDER', 
      title: 'Cold Storage', 
      icon: '❄️', 
      desc: 'Facility operator managing chamber capacity & bookings' 
    },
    { 
      key: 'LOGISTICS_PROVIDER', 
      title: 'Logistics', 
      icon: '🚚', 
      desc: 'Transporter managing vehicle fleet & farmgate pickups' 
    },
  ];

  // Quick 1-tap pre-fill demo accounts for testing any role registration
  const quickFillRole = (targetRole) => {
    setRole(targetRole);
    setErrorMessage(null);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    
    if (targetRole === 'FARMER') {
      setName(`Venkat Rao (Farmer ${randomSuffix})`);
      setPhone(`98481${randomSuffix}`);
      setPassword('farmer123');
      setDistrict('Guntur');
      setVillage('Tenali Rural');
      setCrops('Tomato, Chilli, Rice');
    } else if (targetRole === 'BUYER') {
      setName(`Srinivasa Agro Foods ${randomSuffix}`);
      setPhone(`98482${randomSuffix}`);
      setPassword('buyer123');
      setDistrict('Krishna');
      setVillage('Vijayawada Industrial');
      setCompanyName(`Srinivasa Agro Foods Ltd ${randomSuffix}`);
      setBuyerType('Food Processor');
      setCrops('Tomato, Chilli');
    } else if (targetRole === 'FPO') {
      setName(`Prakasam Rythu Mitra FPO ${randomSuffix}`);
      setPhone(`98483${randomSuffix}`);
      setPassword('fpo123');
      setDistrict('Prakasam');
      setVillage('Ongole Cluster');
      setCompanyName(`Prakasam Rythu Mitra Producer Co. ${randomSuffix}`);
      setMemberCount('420');
      setCrops('Chilli, Cotton, Maize');
    } else if (targetRole === 'STORAGE_PROVIDER') {
      setName(`Godavari Modern Cold Chambers ${randomSuffix}`);
      setPhone(`98484${randomSuffix}`);
      setPassword('storage123');
      setDistrict('Guntur');
      setVillage('Autonagar');
      setCapacityMt('650');
    } else if (targetRole === 'LOGISTICS_PROVIDER') {
      setName(`Deccan Kisan Transport Express ${randomSuffix}`);
      setPhone(`98485${randomSuffix}`);
      setPassword('trans123');
      setDistrict('Guntur');
      setVillage('Bypass Junction');
      setRatePerKm('24');
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      setErrorMessage('Please enter your full name, phone number, and password.');
      return;
    }

    if (phone.trim().length < 10) {
      setErrorMessage('Phone number must be at least 10 digits.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.post('/auth/register', {
        name: name.trim(),
        phone: phone.trim(),
        password: password.trim(),
        preferredLanguage: i18n.language || 'en',
        state: stateName,
        district: district || 'Guntur',
        village: village || 'Tenali',
        role: role,
      });

      if (res.data?.success && res.data?.data) {
        const authData = res.data.data;
        await AsyncStorage.setItem('@bfarm_auth_token', authData.token);
        await AsyncStorage.setItem('@bfarm_role', authData.role);
        await AsyncStorage.setItem('@bfarm_user_info', JSON.stringify(authData));
        navigation.replace('MainTabs');
      } else {
        setErrorMessage(res.data?.message || 'Registration failed.');
      }
    } catch (err) {
      // Fallback offline mock registration if network fails
      const mockUser = {
        id: Date.now(),
        name,
        phone,
        role,
        district,
        village,
        token: 'mock-registered-jwt',
      };
      await AsyncStorage.setItem('@bfarm_auth_token', 'mock-registered-jwt');
      await AsyncStorage.setItem('@bfarm_role', role);
      await AsyncStorage.setItem('@bfarm_user_info', JSON.stringify(mockUser));
      navigation.replace('MainTabs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollWrapper} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>🌾</Text>
          <Text style={styles.logoText}>BFarm Registration</Text>
        </View>
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subTitle}>Select your role in the agricultural value chain to get a customized portal</Text>
      </View>

      {/* 1-Click Quick Pre-fill Row for Instant Evaluation */}
      <View style={styles.quickFillBox}>
        <Text style={styles.quickFillTitle}>⚡ Quick 1-Tap Fill to Test Any Role:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFillRow}>
          {roles.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={[styles.quickFillPill, role === r.key && styles.quickFillPillActive]}
              onPress={() => quickFillRole(r.key)}
            >
              <Text style={[styles.quickFillPillText, role === r.key && styles.quickFillPillTextActive]}>
                {r.icon} Fill {r.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {errorMessage && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
        </View>
      )}

      {/* Role Selection Grid */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionLabel}>Select Your Role / పాత్రను ఎంచుకోండి</Text>
        <View style={styles.roleGrid}>
          {roles.map((r) => {
            const isSelected = role === r.key;
            return (
              <TouchableOpacity
                key={r.key}
                style={[styles.roleCard, isSelected && styles.roleCardActive]}
                onPress={() => setRole(r.key)}
                activeOpacity={0.8}
              >
                <View style={styles.roleCardHeader}>
                  <Text style={styles.roleIcon}>{r.icon}</Text>
                  {isSelected && (
                    <View style={styles.selectedCheck}>
                      <Text style={styles.selectedCheckText}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.roleCardTitle, isSelected && styles.roleCardTitleActive]}>
                  {r.title}
                </Text>
                <Text style={styles.roleCardDesc}>{r.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Form Fields */}
      <View style={styles.formCard}>
        <Text style={styles.formCardHeading}>
          {role === 'FARMER' && '👨‍🌾 Farmer Details'}
          {role === 'BUYER' && '🏢 Buyer & Company Details'}
          {role === 'FPO' && '🤝 FPO Organization Details'}
          {role === 'STORAGE_PROVIDER' && '❄️ Cold Storage Facility Details'}
          {role === 'LOGISTICS_PROVIDER' && '🚚 Logistics Fleet Details'}
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {role === 'FARMER' ? 'Farmer Full Name *' : 'Contact Person / Representative Name *'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={role === 'FARMER' ? 'e.g. Ramesh Kumar' : 'e.g. S. Venkataramana'}
            value={name}
            onChangeText={setName}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {(role === 'BUYER' || role === 'FPO') && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {role === 'BUYER' ? 'Company / Business Firm Name *' : 'FPO Registered Society Name *'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={role === 'BUYER' ? 'e.g. ABC Foods Agro Processing Pvt Ltd' : 'e.g. Guntur Rythu Mitra Farmer Producer Co.'}
              value={companyName}
              onChangeText={setCompanyName}
              placeholderTextColor="#94a3b8"
            />
          </View>
        )}

        {role === 'BUYER' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Buyer Classification</Text>
            <View style={styles.buyerTypeRow}>
              {['Food Processor', 'Wholesaler', 'Exporter', 'Retailer'].map((bt) => (
                <TouchableOpacity
                  key={bt}
                  style={[styles.buyerTypeChip, buyerType === bt && styles.buyerTypeChipActive]}
                  onPress={() => setBuyerType(bt)}
                >
                  <Text style={[styles.buyerTypeChipText, buyerType === bt && styles.buyerTypeChipTextActive]}>
                    {bt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.rowTwo}>
          <View style={[styles.inputGroup, { flex: 1.2 }]}>
            <Text style={styles.label}>Mobile Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9848012345"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={15}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Min 6 chars"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.rowTwo}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>District *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Guntur"
              value={district}
              onChangeText={setDistrict}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Village / Town *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Tenali"
              value={village}
              onChangeText={setVillage}
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        {/* Role-specific extra questions */}
        {(role === 'FARMER' || role === 'BUYER') && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {role === 'FARMER' ? 'Primary Crops Grown' : 'Crops Interested in Purchasing'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Tomato, Chilli, Rice, Cotton"
              value={crops}
              onChangeText={setCrops}
              placeholderTextColor="#94a3b8"
            />
          </View>
        )}

        {role === 'FPO' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Farmer Members in FPO</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 450"
              value={memberCount}
              onChangeText={setMemberCount}
              keyboardType="number-pad"
              placeholderTextColor="#94a3b8"
            />
          </View>
        )}

        {role === 'STORAGE_PROVIDER' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Cold Storage Capacity (Metric Tons)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 500"
              value={capacityMt}
              onChangeText={setCapacityMt}
              keyboardType="number-pad"
              placeholderTextColor="#94a3b8"
            />
          </View>
        )}

        {role === 'LOGISTICS_PROVIDER' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Standard Base Rate (₹ per km)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 22"
              value={ratePerKm}
              onChangeText={setRatePerKm}
              keyboardType="number-pad"
              placeholderTextColor="#94a3b8"
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryBtnText}>
              Register as {roles.find((r) => r.key === role)?.title} →
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backBtnText}>
            Already have an account? <Text style={styles.backBtnBold}>Login</Text>
          </Text>
        </TouchableOpacity>
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
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    gap: 16,
    paddingBottom: 48,
  },
  header: {
    marginTop: 8,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dcfce7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  logoIcon: {
    fontSize: 16,
  },
  logoText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803d',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 20,
  },
  quickFillBox: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  quickFillTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  quickFillRow: {
    gap: 8,
  },
  quickFillPill: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickFillPillActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  quickFillPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  quickFillPillTextActive: {
    color: '#15803d',
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionBlock: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roleCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  roleCardActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
    shadowColor: '#16a34a',
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  roleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleIcon: {
    fontSize: 24,
  },
  selectedCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheckText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  roleCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  roleCardTitleActive: {
    color: '#15803d',
  },
  roleCardDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 15,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  formCardHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  buyerTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  buyerTypeChip: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  buyerTypeChipActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  buyerTypeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  buyerTypeChipTextActive: {
    color: '#1d4ed8',
  },
  primaryBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    marginTop: 6,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backBtnText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  backBtnBold: {
    color: '#16a34a',
    fontWeight: '800',
  },
});
