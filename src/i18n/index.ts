import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all locale files - updated to force cache refresh
import en from './locales/en.json';
import pt from './locales/pt.json';
import es from './locales/es.json';
import zh from './locales/zh.json';
import it from './locales/it.json';

const resources = {
  en: { translation: en },
  pt: { translation: pt },
  es: { translation: es },
  zh: { translation: zh },
  it: { translation: it },
};

// Get saved language or detect from browser
const getSavedLanguage = () => {
  const saved = localStorage.getItem('elp-language');
  if (saved && ['en', 'pt', 'es', 'zh', 'it'].includes(saved)) {
    return saved;
  }
  
  const browserLang = navigator.language.split('-')[0];
  if (['en', 'pt', 'es', 'zh', 'it'].includes(browserLang)) {
    return browserLang;
  }
  
  return 'en'; // Default to English for international audience
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getSavedLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
