import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './LanguageSelector.css';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' }
];

const LanguageSelector = () => {
  const { language, changeLanguage } = useLanguage();

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);

    const hostname = window.location.hostname;

    // 1. Properly set or clear Google Translate cookie
    if (langCode === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
      if (hostname.includes('.')) {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname};`;
      }
    } else {
      const cookieVal = `/en/${langCode}`;
      document.cookie = `googtrans=${cookieVal}; path=/;`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${hostname};`;
      if (hostname.includes('.')) {
        document.cookie = `googtrans=${cookieVal}; path=/; domain=.${hostname};`;
      }
    }

    // 2. Trigger Google Translate combo element if present in DOM
    const selectElem = document.querySelector('.goog-te-combo');
    if (selectElem) {
      selectElem.value = langCode;
      selectElem.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // 3. Smooth reload to ensure full, clean translation without React DOM conflicts
    setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  return (
    <div className="language-selector" title="Language / भाषा">
      <div className="lang-dropdown-btn">
        <span aria-hidden="true">🌐</span>
        <select
          className="lang-select-menu"
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          aria-label="Select website language"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.native} ({lang.label})
            </option>
          ))}
        </select>
        <span className="lang-arrow" aria-hidden="true">▼</span>
      </div>
    </div>
  );
};

export default LanguageSelector;
