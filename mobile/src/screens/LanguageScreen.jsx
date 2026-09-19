import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeAppLanguage } from '../localization/i18n';

export const LanguageScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = useState(i18n.language || 'te');

  const handleSelect = async (lang) => {
    setSelected(lang);
    await changeAppLanguage(lang);
  };

  const handleContinue = () => {
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>🌐 LANGUAGE / భాష / भाषा</Text>
        <Text style={styles.headerTitle}>
          {t('chooseLanguage')}
        </Text>
        <Text style={styles.subTitle}>Select your preferred regional language</Text>
      </View>

      <View style={styles.optionsList}>
        {/* Telugu Option */}
        <TouchableOpacity
          style={[styles.langCard, selected === 'te' && styles.langCardActive]}
          onPress={() => handleSelect('te')}
          activeOpacity={0.8}
        >
          <View style={styles.langLeft}>
            <View style={[styles.langIconBg, selected === 'te' && styles.iconActiveBg]}>
              <Text style={styles.langSymbol}>తె</Text>
            </View>
            <View>
              <Text style={[styles.langTitle, selected === 'te' && styles.textActive]}>తెలుగు</Text>
              <Text style={styles.langSub}>Telugu (ఆంధ్రప్రదేశ్ & తెలంగాణ)</Text>
            </View>
          </View>
          <View style={[styles.radioCircle, selected === 'te' && styles.radioActive]} />
        </TouchableOpacity>

        {/* Hindi Option */}
        <TouchableOpacity
          style={[styles.langCard, selected === 'hi' && styles.langCardActive]}
          onPress={() => handleSelect('hi')}
          activeOpacity={0.8}
        >
          <View style={styles.langLeft}>
            <View style={[styles.langIconBg, selected === 'hi' && styles.iconActiveBg]}>
              <Text style={styles.langSymbol}>हि</Text>
            </View>
            <View>
              <Text style={[styles.langTitle, selected === 'hi' && styles.textActive]}>हिंदी</Text>
              <Text style={styles.langSub}>Hindi (उत्तर एवं मध्य भारत)</Text>
            </View>
          </View>
          <View style={[styles.radioCircle, selected === 'hi' && styles.radioActive]} />
        </TouchableOpacity>

        {/* English Option */}
        <TouchableOpacity
          style={[styles.langCard, selected === 'en' && styles.langCardActive]}
          onPress={() => handleSelect('en')}
          activeOpacity={0.8}
        >
          <View style={styles.langLeft}>
            <View style={[styles.langIconBg, selected === 'en' && styles.iconActiveBg]}>
              <Text style={styles.langSymbol}>En</Text>
            </View>
            <View>
              <Text style={[styles.langTitle, selected === 'en' && styles.textActive]}>English</Text>
              <Text style={styles.langSub}>All Indian Agricultural Hubs</Text>
            </View>
          </View>
          <View style={[styles.radioCircle, selected === 'en' && styles.radioActive]} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={handleContinue}>
          <Text style={styles.primaryBtnText}>{t('continue')} →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 40,
    alignItems: 'center',
  },
  badge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginVertical: 6,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  optionsList: {
    gap: 16,
    marginVertical: 20,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  langCardActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  langIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActiveBg: {
    backgroundColor: '#dcfce7',
  },
  langSymbol: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  langTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  textActive: {
    color: '#15803d',
  },
  langSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  radioActive: {
    borderColor: '#16a34a',
    backgroundColor: '#16a34a',
  },
  footer: {
    paddingBottom: 20,
  },
  primaryBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
});
