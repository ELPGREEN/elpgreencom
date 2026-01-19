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
  
  // Detect browser language with extended matching
  const browserLang = navigator.language.toLowerCase();
  const primaryLang = browserLang.split('-')[0];
  
  // Check for exact matches first (e.g., pt-BR, es-MX, zh-CN)
  if (browserLang.startsWith('pt')) return 'pt';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('it')) return 'it';
  if (browserLang.startsWith('en')) return 'en';
  
  // Fallback check for primary language
  if (['en', 'pt', 'es', 'zh', 'it'].includes(primaryLang)) {
    return primaryLang;
  }
  
  return 'pt'; // Default to Portuguese (company is Brazilian)
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
