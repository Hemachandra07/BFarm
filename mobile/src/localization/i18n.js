import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en.json';
import te from './te.json';
import hi from './hi.json';

const LANGUAGE_KEY = '@bfarm_language';

const resources = {
  en: { translation: en },
  te: { translation: te },
  hi: { translation: hi },
};

export const initI18n = async () => {
  let savedLang = 'te'; // Default to Telugu per demo flow requirement
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored) {
      savedLang = stored;
    }
  } catch (e) {
    // Ignore error
  }

  if (!i18n.isInitialized) {
    await i18n
      .use(initReactI18next)
      .init({
        compatibilityJSON: 'v3',
        resources,
        lng: savedLang,
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
      });
  }
  return savedLang;
};

export const changeAppLanguage = async (lang) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  await i18n.changeLanguage(lang);
};

export default i18n;
