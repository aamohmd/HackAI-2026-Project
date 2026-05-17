import React, { createContext, useState, useEffect, useContext } from 'react';
import * as storage from '../shared/utils/storage';
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
  // Lock to Darija ('ar') as requested
  const [locale, setLocale] = useState<Language>('ar');
  const [isReady, setIsReady] = useState(true);

  // Still keep storage in case we want to re-enable, but force 'ar' for now
  useEffect(() => {
    storage.setItemAsync(LOCALE_KEY, 'ar');
  }, []);

  const setLanguage = async (lang: Language) => {
    // No-op to prevent switching away from Darija
    console.log("Language switching is disabled, locked to Darija.");
  };

  const t = (key: TranslationKey): string => {
    return translations.ar[key] || translations.en[key];
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
