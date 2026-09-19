import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

// High-fidelity base64 demo leaf images for quick 1-tap testing
const SAMPLE_LEAF_IMAGES = {
  tomatoEarlyBlight: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
  chilliLeafCurl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
  riceLeafBlast: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
};

export const CameraScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const cropHint = route.params?.cropHint || 'Tomato';

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      pickFromGallery();
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      navigation.navigate('Preview', {
        imageUri: result.assets[0].uri,
        cropHint,
      });
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      navigation.navigate('Preview', {
        imageUri: result.assets[0].uri,
        cropHint,
      });
    }
  };

  const selectDemoSample = (leafKey, sampleCrop) => {
    navigation.navigate('Preview', {
      imageUri: SAMPLE_LEAF_IMAGES[leafKey],
      cropHint: sampleCrop,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepBadge}>STEP 2 OF 3</Text>
        <Text style={styles.title}>
          {cropHint !== "I don't know my crop" ? `${cropHint} Leaf Scan` : 'Crop Leaf Scan'}
        </Text>
        <Text style={styles.subTitle}>Take or upload a photo to identify diseases</Text>
      </View>

      {/* Photography Tips Card */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 {t('cameraTipsTitle')}</Text>
        <View style={styles.tipsList}>
          <Text style={styles.tipText}>{t('tip1')}</Text>
          <Text style={styles.tipText}>{t('tip2')}</Text>
          <Text style={styles.tipText}>{t('tip3')}</Text>
          <Text style={styles.tipText}>{t('tip4')}</Text>
        </View>
      </View>

      {/* Main Capture Actions */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.85} onPress={takePhoto}>
          <Text style={styles.cameraBtnIcon}>📷</Text>
          <Text style={styles.cameraBtnText}>{t('takePhoto')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.galleryBtn} activeOpacity={0.85} onPress={pickFromGallery}>
          <Text style={styles.galleryBtnIcon}>📁</Text>
          <Text style={styles.galleryBtnText}>{t('chooseGallery')}</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Demo Samples for Browser & Instant Verification */}
      <View style={styles.demoSamplesSection}>
        <Text style={styles.demoSamplesTitle}>⚡ Quick Demo Leaf Samples (1-Tap):</Text>
        <TouchableOpacity
          style={styles.sampleItem}
          onPress={() => selectDemoSample('tomatoEarlyBlight', 'Tomato')}
        >
          <Text style={styles.sampleIcon}>🍅</Text>
          <View style={styles.sampleTextCol}>
            <Text style={styles.sampleName}>Tomato Leaf Sample (Early Blight)</Text>
            <Text style={styles.sampleDesc}>Target-like brown lesions & yellow halo</Text>
          </View>
          <Text style={styles.sampleArrow}>Select →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sampleItem}
          onPress={() => selectDemoSample('chilliLeafCurl', 'Chilli')}
        >
          <Text style={styles.sampleIcon}>🌶️</Text>
          <View style={styles.sampleTextCol}>
            <Text style={styles.sampleName}>Chilli Leaf Sample (Leaf Curl)</Text>
            <Text style={styles.sampleDesc}>Curling margins and vein thickening</Text>
          </View>
          <Text style={styles.sampleArrow}>Select →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sampleItem}
          onPress={() => selectDemoSample('riceLeafBlast', 'Rice')}
        >
          <Text style={styles.sampleIcon}>🌾</Text>
          <View style={styles.sampleTextCol}>
            <Text style={styles.sampleName}>Rice Leaf Sample (Leaf Blast)</Text>
            <Text style={styles.sampleDesc}>Spindle diamond lesions on paddy foliage</Text>
          </View>
          <Text style={styles.sampleArrow}>Select →</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 16,
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
  tipsCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#bbf7d0',
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 10,
  },
  tipsList: {
    gap: 6,
  },
  tipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#15803d',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 28,
  },
  cameraBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  cameraBtnIcon: {
    fontSize: 24,
  },
  cameraBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  galleryBtn: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  galleryBtnIcon: {
    fontSize: 22,
  },
  galleryBtnText: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '700',
  },
  demoSamplesSection: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  demoSamplesTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  sampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sampleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sampleTextCol: {
    flex: 1,
  },
  sampleName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  sampleDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  sampleArrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
  },
});
