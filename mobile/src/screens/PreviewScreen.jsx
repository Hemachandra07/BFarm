import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export const PreviewScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { imageUri, cropHint } = route.params || {};

  const handleAnalyze = () => {
    navigation.replace('DiagnosisLoading', {
      imageUri,
      cropHint,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepBadge}>STEP 3 OF 3</Text>
        <Text style={styles.title}>{t('previewTitle')}</Text>
        <Text style={styles.subTitle}>Confirm the leaf symptoms are sharp and in focus</Text>
      </View>

      {/* Image Preview Box */}
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderIcon}>🌿</Text>
            <Text style={styles.placeholderText}>Leaf Image Selected</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.retakeBtn}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retakeBtnText}>↻ {t('retake')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.analyzeBtn}
          activeOpacity={0.85}
          onPress={handleAnalyze}
        >
          <Text style={styles.analyzeBtnText}>🔬 {t('analyze')}</Text>
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
    marginTop: 10,
    alignItems: 'center',
  },
  stepBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  subTitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 320,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginVertical: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
  },
  placeholderIcon: {
    fontSize: 64,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 14,
    paddingBottom: 20,
  },
  retakeBtn: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  retakeBtnText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '700',
  },
  analyzeBtn: {
    flex: 1.6,
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
  analyzeBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
});
