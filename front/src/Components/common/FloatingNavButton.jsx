import React from 'react';
import NavButton from './NavButton';
import { ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import './FloatingNavButton.css';

const FloatingNavButton = () => {
    const { t } = useTranslation();
    const location = useLocation();

    // Don't show the button if already on the products list page
    if (location.pathname.startsWith('/products/all')) {
        return null;
    }

    return (
        <div className={`floating-nav-container`}>
            <NavButton 
                to="/products/all"  
                variant="primary" 
                size="lg"
                className="floating-nav-btn shadow-lg"
                ariaLabel="Browse All Products"
                icon={<ShoppingBag size={20} />}
            >
                {t('products.allProducts', 'All Products')}
            </NavButton>
        </div>
    );
};

export default FloatingNavButton;
