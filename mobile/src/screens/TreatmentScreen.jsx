import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AudioPlayerButton } from '../components/AudioPlayerButton';
import { apiClient } from '../api/client';

export const TreatmentScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const { diagnosis } = route.params || {};

  const diseaseName = diagnosis?.disease || 'Early Blight';
  const [steps, setSteps] = useState(diagnosis?.treatmentSteps || [
    '1. Remove heavily affected lower leaves and dispose safely.',
    '2. Keep adequate spacing (45-60 cm) between plants for aeration.',
    '3. Avoid overhead wetting of foliage; water soil directly.',
    '4. Maintain clean field hygiene and remove fallen plant debris.',
    '5. Follow locally approved KVK or university treatment guidance.'
  ]);
  const [prevention, setPrevention] = useState(diagnosis?.preventionTips || '• Practice crop rotation\n• Inspect field weekly\n• Use certified disease-free seeds');
  const [warning, setWarning] = useState(diagnosis?.chemicalWarning || t('chemicalWarning'));

  useEffect(() => {
    const fetchTreatment = async () => {
      try {
        if (diagnosis?.treatment?.diseaseId) {
          const res = await apiClient.get(`/treatments/${diagnosis.treatment.diseaseId}?lang=${i18n.language}`);
          if (res.data?.success && res.data?.data) {
            const tr = res.data.data;
            if (tr.steps) {
              try {
                if (tr.steps.startsWith('[')) {
                  setSteps(JSON.parse(tr.steps));
                } else {
                  setSteps(tr.steps.split('\n'));
                }
              } catch (e) {
                setSteps(tr.steps.split('\n'));
              }
            }
            if (tr.prevention) setPrevention(tr.prevention);
            if (tr.warning) setWarning(tr.warning);
          }
        }
      } catch (e) {
        // Keep initial fallback steps
      }
    };
    fetchTreatment();
  }, [i18n.language]);

  const speechText = `${diseaseName}. ${t('whatYouCanDo')}. ${steps.join('. ')}. ${t('prevention')}. ${prevention}`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with Title and Voice Listen Button */}
      <View style={styles.headerCard}>
        <View style={styles.titleRow}>
          <Text style={styles.diseaseIcon}>🌱</Text>
          <View style={styles.titleTextCol}>
            <Text style={styles.diseaseTitle}>{diseaseName}</Text>
            <Text style={styles.cropSub}>{diagnosis?.crop || 'Tomato'} Protection Plan</Text>
          </View>
        </View>

        <View style={styles.audioRow}>
          <AudioPlayerButton textToSpeak={speechText} language={i18n.language} />
        </View>
      </View>

      {/* Actionable Treatment Steps */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 {t('whatYouCanDo')}</Text>
        <View style={styles.stepsList}>
          {steps.map((step, idx) => (
            <View key={idx} style={styles.stepItem}>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Prevention Advice */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🛡️ {t('prevention')}</Text>
        <Text style={styles.preventionText}>{prevention}</Text>
      </View>

      {/* Mandatory Safety Alert */}
      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>⚠️ Important Agricultural Warning:</Text>
        <Text style={styles.warningText}>{warning}</Text>
      </View>

      {/* Farmer Next Step: Check Market & Sell Produce */}
      <View style={styles.marketCtaCard}>
        <Text style={styles.marketCtaTitle}>💰 Ready to check prices and buyers?</Text>
        <Text style={styles.marketCtaSub}>
          Check today's mandi rates in Guntur, connect with verified food processors, or reserve cold storage.
        </Text>
        <TouchableOpacity
          style={styles.marketBtn}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('Market', { crop: diagnosis?.crop || 'Tomato' })}
        >
          <Text style={styles.marketBtnText}>{t('checkMarketPrices')} →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8fafc',
    gap: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  diseaseIcon: {
    fontSize: 36,
  },
  titleTextCol: {
    flex: 1,
  },
  diseaseTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  cropSub: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '700',
    marginTop: 2,
  },
  audioRow: {
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 14,
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  stepText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 22,
    fontWeight: '600',
  },
  preventionText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  warningCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    borderRadius: 16,
    padding: 18,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#991b1b',
    marginBottom: 6,
  },
  warningText: {
    fontSize: 13,
    color: '#7f1d1d',
    lineHeight: 19,
  },
  marketCtaCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#86efac',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginTop: 6,
  },
  marketCtaTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#166534',
    textAlign: 'center',
  },
  marketCtaSub: {
    fontSize: 13,
    color: '#15803d',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 18,
  },
  marketBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  marketBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
});
