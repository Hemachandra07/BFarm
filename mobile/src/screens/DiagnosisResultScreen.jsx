import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

export const DiagnosisResultScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const { diagnosis, imageUri } = route.params || {};

  const crop = diagnosis?.crop || 'Tomato';
  const disease = diagnosis?.disease || 'Early Blight';
  const confidencePercent = diagnosis?.confidence ? Math.round(diagnosis.confidence * 100) : 94;
  const severity = diagnosis?.severity || 'Medium';
  const findings = diagnosis?.findings || 'Concentric target-like brown spots and chlorotic yellow halos observed on the affected leaf.';
  const isUncertain = diagnosis?.isUncertain || confidencePercent < 60;

  const getCropDisplay = (cropName) => {
    if (cropName === 'Tomato') {
      return i18n.language === 'te' ? '🍅 టమోటా (Tomato)' : i18n.language === 'hi' ? '🍅 टमाटर (Tomato)' : '🍅 Tomato';
    }
    if (cropName === 'Chilli') {
      return i18n.language === 'te' ? '🌶️ మిరప (Chilli)' : i18n.language === 'hi' ? '🌶️ मिर्च (Chilli)' : '🌶️ Chilli';
    }
    if (cropName === 'Rice') {
      return i18n.language === 'te' ? '🌾 వరి (Rice)' : i18n.language === 'hi' ? '🌾 चावल (Rice)' : '🌾 Rice';
    }
    return cropName;
  };

  const handleViewTreatment = () => {
    navigation.navigate('Treatment', { diagnosis });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Banner */}
      <View style={styles.topCard}>
        <View style={styles.headerPill}>
          <Text style={styles.headerPillText}>AI PATHOLOGY RESULT</Text>
        </View>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.thumbnail} resizeMode="cover" />
        )}

        {/* Crop Name */}
        <View style={styles.sectionRow}>
          <Text style={styles.fieldLabel}>Crop / పంట / फसल</Text>
          <Text style={styles.cropValue}>{getCropDisplay(crop)}</Text>
        </View>

        {/* Disease Problem */}
        <View style={styles.sectionRow}>
          <Text style={styles.fieldLabel}>{t('possibleProblem')}</Text>
          <Text style={styles.diseaseValue}>
            {isUncertain ? '⚠️ Uncertain Diagnosis' : `⚠️ ${disease}`}
          </Text>
        </View>

        {/* Metrics Bar */}
        <View style={styles.metricsBar}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>{t('confidence')}</Text>
            <Text style={[styles.metricVal, confidencePercent >= 80 ? styles.confHigh : styles.confLow]}>
              {confidencePercent}%
            </Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>{t('severity')}</Text>
            <Text style={[styles.metricVal, severity === 'High' ? styles.sevHigh : styles.sevMed]}>
              {severity}
            </Text>
          </View>
        </View>

        {/* Low confidence warning */}
        {isUncertain && (
          <View style={styles.uncertainCard}>
            <Text style={styles.uncertainTitle}>⚠️ {t('uncertainTitle')}</Text>
            <Text style={styles.uncertainDesc}>{t('uncertainDesc')}</Text>
          </View>
        )}

        {/* Findings Box */}
        <View style={styles.findingsBox}>
          <Text style={styles.findingsTitle}>🔍 {t('whatWeFound')}</Text>
          <Text style={styles.findingsText}>{findings}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.treatmentBtn}
          activeOpacity={0.88}
          onPress={handleViewTreatment}
        >
          <Text style={styles.treatmentBtnText}>🌱 {t('viewTreatment')} →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.anotherBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CropSelection')}
        >
          <Text style={styles.anotherBtnText}>📷 {t('checkAnother')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8fafc',
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  headerPill: {
    backgroundColor: '#dcfce7',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  headerPillText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  thumbnail: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    marginBottom: 16,
  },
  sectionRow: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  cropValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  diseaseValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#dc2626',
    marginTop: 2,
  },
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 10,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#cbd5e1',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  confHigh: {
    color: '#16a34a',
  },
  confLow: {
    color: '#d97706',
  },
  sevHigh: {
    color: '#dc2626',
  },
  sevMed: {
    color: '#d97706',
  },
  uncertainCard: {
    backgroundColor: '#fef3c7',
    borderWidth: 1.5,
    borderColor: '#fde68a',
    borderRadius: 12,
    padding: 14,
    marginVertical: 12,
  },
  uncertainTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400e',
  },
  uncertainDesc: {
    fontSize: 12,
    color: '#b45309',
    marginTop: 4,
  },
  findingsBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
  },
  findingsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
  },
  findingsText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  actionSection: {
    gap: 12,
    marginTop: 20,
    paddingBottom: 10,
  },
  treatmentBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  treatmentBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  anotherBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  anotherBtnText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '700',
  },
});
