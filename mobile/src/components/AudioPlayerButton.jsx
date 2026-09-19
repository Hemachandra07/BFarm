import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { useTranslation } from 'react-i18next';

export const AudioPlayerButton = ({ textToSpeak, language = 'te' }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggleSpeech = () => {
    if (isPlaying) {
      // Stop speech
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      } else {
        Speech.stop();
      }
      setIsPlaying(false);
    } else {
      // Start speech
      setIsPlaying(true);
      const cleanText = textToSpeak ? textToSpeak.replace(/[•\d\.\-\*⚠️]/g, '').trim() : '';

      const langCodeMap = {
        te: 'te-IN',
        hi: 'hi-IN',
        en: 'en-IN',
      };
      const speechLang = langCodeMap[language] || 'en-IN';

      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = speechLang;
        utterance.rate = 0.9;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      } else {
        Speech.speak(cleanText, {
          language: speechLang,
          rate: 0.9,
          onDone: () => setIsPlaying(false),
          onError: () => setIsPlaying(false),
        });
      }
    }
  };

  return (
    <TouchableOpacity
      style={[styles.btn, isPlaying && styles.playingBtn]}
      onPress={handleToggleSpeech}
      activeOpacity={0.8}
    >
      <Text style={styles.btnText}>
        {isPlaying ? `⏹️ ${t('stopListening')}` : `🔊 ${t('listen')}`}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#bae6fd',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  playingBtn: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  btnText: {
    color: '#0369a1',
    fontWeight: '700',
    fontSize: 14,
  },
});
