import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { supportedLanguages } from '../i18n';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = supportedLanguages[i18n.language as keyof typeof supportedLanguages] || supportedLanguages.en;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const changeLanguage = (languageCode: string) => {
    // Store language preference in localStorage
    localStorage.setItem('preferred-language', languageCode);
    
    // Change i18n language
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
    
    // Update URL with language parameter
    const searchParams = new URLSearchParams(location.search);
    if (languageCode === 'en') {
      searchParams.delete('lang');
    } else {
      searchParams.set('lang', languageCode);
    }
    
    const newSearch = searchParams.toString();
    const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
    navigate(newUrl, { replace: true });
    
    // Update document attributes
    const language = supportedLanguages[languageCode as keyof typeof supportedLanguages];
    if (language) {
      document.documentElement.dir = language.dir;
      document.documentElement.lang = languageCode;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, languageCode: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      changeLanguage(languageCode);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label={`Current language: ${currentLanguage.nativeName}. Click to change language`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="h-4 w-4 text-gray-600 dark:text-gray-300" aria-hidden="true" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline">
          {currentLanguage.nativeName}
        </span>
        <span className="text-lg" aria-hidden="true">{currentLanguage.flag}</span>
        <ChevronDown 
          className={`h-4 w-4 text-gray-600 dark:text-gray-300 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-slide-up"
          role="listbox"
          aria-label="Language selection"
        >
          {Object.entries(supportedLanguages).map(([code, language]) => (
            <button
              key={code}
              onClick={() => changeLanguage(code)}
              onKeyDown={(e) => handleKeyDown(e, code)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${
                i18n.language === code 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                  : 'text-gray-700 dark:text-gray-200'
              }`}
              role="option"
              aria-selected={i18n.language === code}
              tabIndex={0}
            >
              <span className="text-xl" aria-hidden="true">{language.flag}</span>
              <div className="flex-1">
                <div className="font-medium">{language.nativeName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{language.name}</div>
              </div>
              {i18n.language === code && (
                <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;