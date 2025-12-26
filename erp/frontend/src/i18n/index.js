// src/i18n/index.js - Multi-language Configuration
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import te from './locales/te.json';

const resources = {
    en: { translation: en },
    hi: { translation: hi },
    te: { translation: te }
};

// Get saved language safely
const getSavedLanguage = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('language') || 'en';
    }
    return 'en';
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: getSavedLanguage(),
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
