import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { supportedLanguages, defaultLanguage } from '../i18n';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    // Set document direction and language
    const currentLang = supportedLanguages[i18n.language as keyof typeof supportedLanguages] || supportedLanguages[defaultLanguage];
    document.documentElement.dir = currentLang.dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const changeLanguage = (languageCode: string) => {
    if (supportedLanguages[languageCode as keyof typeof supportedLanguages]) {
      i18n.changeLanguage(languageCode);
    }
  };

  const getCurrentLanguage = () => {
    return supportedLanguages[i18n.language as keyof typeof supportedLanguages] || supportedLanguages[defaultLanguage];
  };

  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat(i18n.language, options).format(date);
  };

  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(i18n.language, options).format(number);
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return {
    t,
    i18n,
    currentLanguage: getCurrentLanguage(),
    changeLanguage,
    formatDate,
    formatNumber,
    formatCurrency,
    isRTL: getCurrentLanguage().dir === 'rtl'
  };
};