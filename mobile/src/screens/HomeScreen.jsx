import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetworkBanner } from '../components/NetworkBanner';
import { changeAppLanguage } from '../localization/i18n';

export const HomeScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [userName, setUserName] = useState('Farmer');
  const [userRole, setUserRole] = useState('FARMER');
  const [currentLang, setCurrentLang] = useState(i18n.language || 'te');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const raw = await AsyncStorage.getItem('@bfarm_user_info');
        if (raw) {
          const u = JSON.parse(raw);
          if (u.name) setUserName(u.name.split(' ')[0]);
          if (u.role) setUserRole(u.role);
        }
      } catch (e) {
        // Ignore
      }
    };
    loadUser();
  }, []);

  const cycleLanguage = async () => {
    const nextLang = currentLang === 'te' ? 'hi' : currentLang === 'hi' ? 'en' : 'te';
    setCurrentLang(nextLang);
    await changeAppLanguage(nextLang);
  };

  const getLangDisplayName = (lang) => {
    if (lang === 'te') return 'తెలుగు ▼';
    if (lang === 'hi') return 'हिंदी ▼';
    return 'English ▼';
  };

  return (
    <View style={styles.screenWrapper}>
      {/* Offline/Online Network Banner */}
      <NetworkBanner />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Top App Header */}
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <Text style={styles.brandIcon}>🌾</Text>
            <Text style={styles.brandName}>{t('appName')}</Text>
          </View>

          {/* Language Switcher Pill */}
          <TouchableOpacity style={styles.langPill} onPress={cycleLanguage} activeOpacity={0.8}>
            <Text style={styles.langPillText}>{getLangDisplayName(currentLang)}</Text>
          </TouchableOpacity>
        </View>

        {/* Farmer Greeting */}
        <View style={styles.greetingBox}>
          <Text style={styles.greetingTitle}>
            {t('goodMorning') !== 'goodMorning' ? t('goodMorning') : `Good morning, ${userName}!`}
          </Text>
          <Text style={styles.greetingSub}>{t('howCanWeHelp')}</Text>
        </View>

        {/* PRIMARY CTA: CHECK MY CROP (Plantix Core Journey) */}
        <TouchableOpacity
          style={styles.heroCard}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('CropSelection')}
        >
          <View style={styles.heroCameraCircle}>
            <Text style={styles.heroCameraIcon}>📷</Text>
          </View>
          <Text style={styles.heroTitle}>{t('checkCrop')}</Text>
          <Text style={styles.heroSubtitle}>{t('checkCropSub')}</Text>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillText}>Instant AI Scan →</Text>
          </View>
        </TouchableOpacity>

        {/* FARMER MARKETPLACE HERO STRIP */}
        <View style={styles.farmerMarketStrip}>
          <TouchableOpacity
            style={styles.stripBtnGreen}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ProduceListing')}
          >
            <Text style={styles.stripIcon}>📢</Text>
            <View>
              <Text style={styles.stripTitle}>List Produce for Sale</Text>
              <Text style={styles.stripSub}>Sell direct to traders</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.stripBtnBlue}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('FarmerOrders')}
          >
            <Text style={styles.stripIcon}>🤝</Text>
            <View>
              <Text style={styles.stripTitle}>Buyer Offers</Text>
              <Text style={styles.stripSub}>Accept purchase offers</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 2x2 Services Grid */}
        <View style={styles.gridSection}>
          <View style={styles.gridRow}>
            {/* 1. Market Prices */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Market')}
            >
              <View style={[styles.gridIconBg, { backgroundColor: '#fef3c7' }]}>
                <Text style={styles.gridIcon}>💰</Text>
              </View>
              <Text style={styles.gridTitle}>{t('market')}</Text>
              <Text style={styles.gridSub}>Mandi Rates</Text>
            </TouchableOpacity>

            {/* 2. Buyers / FPOs */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Buyers')}
            >
              <View style={[styles.gridIconBg, { backgroundColor: '#dbeafe' }]}>
                <Text style={styles.gridIcon}>🏢</Text>
              </View>
              <Text style={styles.gridTitle}>{t('buyersFpo')}</Text>
              <Text style={styles.gridSub}>Direct Connect</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gridRow}>
            {/* 3. Cold Storage */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Storage')}
            >
              <View style={[styles.gridIconBg, { backgroundColor: '#cffafe' }]}>
                <Text style={styles.gridIcon}>❄️</Text>
              </View>
              <Text style={styles.gridTitle}>{t('storage')}</Text>
              <Text style={styles.gridSub}>Preserve Quality</Text>
            </TouchableOpacity>

            {/* 4. Logistics & Transport */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Logistics')}
            >
              <View style={[styles.gridIconBg, { backgroundColor: '#ede9fe' }]}>
                <Text style={styles.gridIcon}>🚚</Text>
              </View>
              <Text style={styles.gridTitle}>{t('logistics')}</Text>
              <Text style={styles.gridSub}>Farm Pickup</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Market Price Ticker Preview */}
        <TouchableOpacity
          style={styles.tickerBanner}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Market')}
        >
          <View style={styles.tickerLeft}>
            <Text style={styles.tickerTag}>TODAY'S MANDI</Text>
            <Text style={styles.tickerText}>🍅 Tomato: Guntur ₹2,800/q (▲ UP)</Text>
          </View>
          <Text style={styles.tickerArrow}>View All →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 20,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIcon: {
    fontSize: 28,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: -0.5,
  },
  langPill: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#16a34a',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  langPillText: {
    color: '#15803d',
    fontWeight: '700',
    fontSize: 13,
  },
  greetingBox: {
    marginBottom: 16,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  greetingSub: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: '#15803d',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 14,
  },
  heroCameraCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroCameraIcon: {
    fontSize: 32,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#dcfce7',
    textAlign: 'center',
    marginTop: 4,
  },
  heroPill: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 14,
  },
  heroPillText: {
    color: '#15803d',
    fontWeight: '800',
    fontSize: 13,
  },
  farmerMarketStrip: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  stripBtnGreen: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderWidth: 1.5,
    borderColor: '#86efac',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  stripBtnBlue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderWidth: 1.5,
    borderColor: '#bae6fd',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  stripIcon: {
    fontSize: 22,
  },
  stripTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  stripSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  gridSection: {
    gap: 12,
    marginBottom: 14,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  gridIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  gridIcon: {
    fontSize: 22,
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  gridSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  tickerBanner: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tickerLeft: {
    flex: 1,
  },
  tickerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  tickerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  tickerArrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
  },
});
