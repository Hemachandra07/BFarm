import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

export const CropSelectionScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const crops = [
    { name: 'Tomato', te: 'టమోటా', hi: 'टमाटर', icon: '🍅', color: '#fee2e2' },
    { name: 'Rice', te: 'వరి / ధాన్యం', hi: 'चावल / धान', icon: '🌾', color: '#fef3c7' },
    { name: 'Chilli', te: 'మిరప', hi: 'मिर्च', icon: '🌶️', color: '#ffe4e6' },
    { name: 'Cotton', te: 'పత్తి', hi: 'కపాస్', icon: '☁️', color: '#e0f2fe' },
    { name: 'Maize', te: 'మొక్కజొన్న', hi: 'మక్కా', icon: '🌽', color: '#fef9c3' },
    { name: 'Groundnut', te: 'వేరుశనగ', hi: 'మూంగ్ఫలీ', icon: '🥜', color: '#ffedd5' },
    { name: 'Potato', te: 'బంగాళాదుంప', hi: 'ఆలూ', icon: '🥔', color: '#f3e8ff' },
  ];

  const handleSelectCrop = (cropName) => {
    navigation.navigate('Camera', { cropHint: cropName });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepBadge}>STEP 1 OF 3</Text>
        <Text style={styles.title}>{t('selectCrop')}</Text>
        <Text style={styles.subTitle}>Select the crop you want to inspect for pests or diseases</Text>
      </View>

      <View style={styles.grid}>
        {crops.map((crop) => (
          <TouchableOpacity
            key={crop.name}
            style={styles.cropCard}
            activeOpacity={0.8}
            onPress={() => handleSelectCrop(crop.name)}
          >
            <View style={[styles.iconCircle, { backgroundColor: crop.color }]}>
              <Text style={styles.cropIcon}>{crop.icon}</Text>
            </View>
            <Text style={styles.cropName}>{crop.name}</Text>
            <Text style={styles.cropLocal}>{crop.te}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* "I don't know my crop" fallback button */}
      <TouchableOpacity
        style={styles.unknownBtn}
        activeOpacity={0.85}
        onPress={() => handleSelectCrop('I don\'t know my crop')}
      >
        <Text style={styles.unknownBtnIcon}>🔍</Text>
        <View style={styles.unknownTextCol}>
          <Text style={styles.unknownTitle}>{t('dontKnowCrop')}</Text>
          <Text style={styles.unknownSub}>Our AI will automatically identify your crop from the photo</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
  header: {
    marginBottom: 20,
  },
  stepBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
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
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  cropCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cropIcon: {
    fontSize: 28,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  cropLocal: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '600',
    marginTop: 2,
  },
  unknownBtn: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#86efac',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
  },
  unknownBtnIcon: {
    fontSize: 28,
  },
  unknownTextCol: {
    flex: 1,
  },
  unknownTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#15803d',
  },
  unknownSub: {
    fontSize: 12,
    color: '#166534',
    marginTop: 2,
  },
});
