import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('he');
  const [direction, setDirection] = useState('rtl');

  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language') || 'he';
    setLanguage(savedLang);
    setDirection(savedLang === 'he' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('dir', savedLang === 'he' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', savedLang);
  }, []);

  const switchLanguage = (newLang) => {
    setLanguage(newLang);
    setDirection(newLang === 'he' ? 'rtl' : 'ltr');
    localStorage.setItem('preferred-language', newLang);
    document.documentElement.setAttribute('dir', newLang === 'he' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLang);
  };

  const t = (heText, enText) => {
    return language === 'he' ? heText : enText;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};