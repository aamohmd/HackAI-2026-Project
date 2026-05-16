import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { translations, Language, TranslationKey } from '../constants/translations';

const LOCALE_KEY = 'MIZAN_LOCALE';

interface I18nContextType {
  locale: Language | null;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: TranslationKey) => string;
  isReady: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Language | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadLocale() {
      const savedLocale = await SecureStore.getItemAsync(LOCALE_KEY);
      if (savedLocale === 'en' || savedLocale === 'ar') {
        setLocale(savedLocale as Language);
      }
      setIsReady(true);
    }
    loadLocale();
  }, []);

  const setLanguage = async (lang: Language) => {
    await SecureStore.setItemAsync(LOCALE_KEY, lang);
    setLocale(lang);
  };

  const t = (key: TranslationKey): string => {
    if (!locale) return translations.en[key];
    return translations[locale][key] || translations.en[key];
  };

  return (
    <I18nContext.Provider value={{ locale, setLanguage, t, isReady }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
};
