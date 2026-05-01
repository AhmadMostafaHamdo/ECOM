import React, { useState, useContext } from 'react';
import NavButton from './NavButton';
import { ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logincontext } from '../context/Contextprovider';
import './FloatingNavButton.css';

const FloatingNavButton = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { account, setShowLoginPrompt } = useContext(Logincontext);

    // Persistent position logic
    const [initialPos] = useState(() => {
        const saved = localStorage.getItem('floating_btn_offset');
        return saved ? JSON.parse(saved) : { x: 0, y: 0 };
    });

    if (location.pathname.startsWith('/products/all')) {
        return null;
    }

    const handleDragEnd = (event, info) => {
        const newOffset = {
            x: initialPos.x + info.offset.x,
            y: initialPos.y + info.offset.y
        };
        localStorage.setItem('floating_btn_offset', JSON.stringify(newOffset));
    };

    const handleButtonClick = (e) => {
        if (!account) {
            e.preventDefault();
            setShowLoginPrompt(true);
        }
    };

    return (
        <motion.div 
            drag
            dragMomentum={false}
            dragElastic={0.1}
            initial={initialPos}
            onDragEnd={handleDragEnd}
            // Constraints to keep it within the viewport roughly
            dragConstraints={{
                left: 0,
                right: window.innerWidth - 180,
                top: -window.innerHeight + 120,
                bottom: 0
            }}
            className="floating-nav-container"
            whileDrag={{ scale: 1.05, opacity: 0.9 }}
            style={{ touchAction: 'none' }}
        >
            <NavButton 
                to="/products/all"  
                variant="primary" 
                size="lg"
                className="floating-nav-btn shadow-lg"
                ariaLabel="Browse All Products"
                icon={<ShoppingBag size={20} />}
                onClick={handleButtonClick}
            >
                {t('products.allProducts', 'All Products')}
            </NavButton>
        </motion.div>
    );
};

export default FloatingNavButton;
