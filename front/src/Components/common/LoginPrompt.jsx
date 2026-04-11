import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Logincontext } from '../context/Contextprovider';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import './LoginPrompt.css';

const LoginPrompt = ({ onCancel }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { account, setShowLoginPrompt } = useContext(Logincontext);
    const [seconds, setSeconds] = useState(3);

    useEffect(() => {
        if (account) {
            setShowLoginPrompt(false);
            return;
        }

        const interval = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setShowLoginPrompt(false); // Close prompt before navigating
                    navigate('/login');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [navigate, account, setShowLoginPrompt]);

    return (
        <div className="login_prompt_overlay">
            <div className="login_prompt_card">
                <div className="login_icon_box">
                    <AccountCircleIcon />
                </div>
                <h2>{t('auth.loginRequired')}</h2>
                <p>{t('auth.loginPromptMessage')}</p>
                <div className="countdown_timer">
                    {t('auth.redirectingIn')}{' '}
                    <span className="timer_number">{seconds}</span>{' '}
                    {t('auth.seconds')}
                </div>
                <div className="login_prompt_actions">
                    <button 
                        className="prompt_btn login_now" 
                        onClick={() => navigate('/login')}
                    >
                        {t('auth.loginNow')}
                    </button>
                    <button 
                        className="prompt_btn close_prompt" 
                        onClick={onCancel}
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPrompt;
