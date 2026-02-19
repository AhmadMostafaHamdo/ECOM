import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        // Save language preference to localStorage
        localStorage.setItem('i18nextLng', lng);
        
        // Update document direction for RTL/LTR
        document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lng;
    };

    return (
        <div className="language_switcher">
            <button 
                className={`lang_btn ${i18n.language === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
                title="English"
            >
                <span className="flag">🇺🇸</span>
                <span className="lang_text">EN</span>
            </button>
            <button 
                className={`lang_btn ${i18n.language === 'ar' ? 'active' : ''}`}
                onClick={() => changeLanguage('ar')}
                title="العربية"
            >
                <span className="flag">🇸🇦</span>
                <span className="lang_text">AR</span>
            </button>
        </div>
    );
};

export default LanguageSwitcher;
