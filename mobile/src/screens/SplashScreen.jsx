import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export const SplashScreen = ({ navigation }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>🌾</Text>
        </View>

        <Text style={styles.brandTitle}>{t('appName')}</Text>
        <Text style={styles.tagline}>{t('tagline')}</Text>
        <Text style={styles.subTagline}>{t('subTagline')}</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={() => navigation.replace('Language')}
        >
          <Text style={styles.primaryBtnText}>{t('getStarted')} →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15803d',
    justifyContent: 'space-between',
    padding: 30,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logoIcon: {
    fontSize: 50,
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '700',
    color: '#dcfce7',
    textAlign: 'center',
    marginTop: 8,
  },
  subTagline: {
    fontSize: 14,
    color: '#bbf7d0',
    textAlign: 'center',
    marginTop: 6,
  },
  footer: {
    width: '100%',
    paddingBottom: 20,
  },
  primaryBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#15803d',
    fontSize: 18,
    fontWeight: '800',
  },
});
