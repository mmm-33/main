import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation files for immediate loading
import enTranslations from './locales/en.json';
import itTranslations from './locales/it.json';
import deTranslations from './locales/de.json';
import frTranslations from './locales/fr.json';
import esTranslations from './locales/es.json';
import ruTranslations from './locales/ru.json';

export const supportedLanguages = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  ru: { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' }
};

export const defaultLanguage = 'en';

const resources = {
  en: { translation: enTranslations },
  it: { translation: itTranslations },
  de: { translation: deTranslations },
  fr: { translation: frTranslations },
  es: { translation: esTranslations },
  ru: { translation: ruTranslations }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: defaultLanguage,
    debug: import.meta.env.DEV,
    
    // Language detection options
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'preferred-language',
      caches: ['localStorage'],
      excludeCacheFor: ['cimode'],
      checkWhitelist: true
    },

    interpolation: {
      escapeValue: false // React already does escaping
    },

    // Backend options for lazy loading
    backend: {
      loadPath: '/locales/{{lng}}.json',
      allowMultiLoading: false,
      crossDomain: false,
      withCredentials: false,
      requestOptions: {
        cache: 'default'
      }
    },

    // React options
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em', 'b', 'span']
    },

    // Whitelist supported languages
    supportedLngs: Object.keys(supportedLanguages),
    nonExplicitSupportedLngs: false,

    // Namespace and key separator
    ns: ['translation'],
    defaultNS: 'translation',
    keySeparator: '.',
    nsSeparator: ':',

    // Missing key handling
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: import.meta.env.DEV ? (lng, ns, key) => {
      console.warn(`Missing translation key: ${key} for language: ${lng}`);
    } : undefined,

    // Performance optimizations
    load: 'languageOnly', // Don't load country-specific variants
    preload: [defaultLanguage], // Preload default language
    cleanCode: true,
    
    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_'
  });

// Handle language change events
i18n.on('languageChanged', (lng) => {
  const language = supportedLanguages[lng as keyof typeof supportedLanguages];
  if (language) {
    document.documentElement.dir = language.dir;
    document.documentElement.lang = lng;
  }
});

export default i18n;