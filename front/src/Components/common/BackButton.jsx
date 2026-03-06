import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import './BackButton.css';

const BackButton = ({ className = '', showText = true, style = {} }) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const handleBack = () => {
        // Double check if there is a history to go back to, otherwise go to home
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/');
        }
    };

    return (
        <button
            type="button"
            onClick={handleBack}
            className={`back-button ${className} ${isRTL ? 'rtl' : 'ltr'}`}
            style={style}
            aria-label={t('common.back', 'Back')}
        >
            <div className="icon-wrapper">
                {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
            </div>
            {showText && (
                <span className="back-text">
                    {t('common.back', isRTL ? 'رجوع' : 'Back')}
                </span>
            )}
        </button>
    );
};

export default BackButton;
