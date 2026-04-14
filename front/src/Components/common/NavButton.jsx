import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';

/**
 * Reusable Navigation Button Component
 * 
 * @param {string} to - The path to navigate to
 * @param {boolean} activeClass - Optional class to apply when the current route matches the 'to' path
 * @param {boolean} exact - If true, matches the exact route for the active state
 * @param {string} ariaLabel - Accessibility label
 */
const NavButton = ({
    to,
    children,
    activeClass = 'active',
    exact = false,
    ariaLabel,
    disabled = false,
    ...props
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine if the current route matches 'to' to set active style
    const isActive = exact
        ? location.pathname === to
        : location.pathname.startsWith(to);

    const handleNavigation = (e) => {
        if (props.onClick) {
            props.onClick(e);
        }
        
        // Prevent default navigation if handled manually or disabled
        if (!e.defaultPrevented && !disabled && to) {
            navigate(to);
        }
    };

    return (
        <Button
            onClick={handleNavigation}
            disabled={disabled}
            aria-label={ariaLabel || (typeof children === 'string' ? children : 'Navigation button')}
            className={`${isActive ? activeClass : ''} ${props.className || ''}`}
            {...props}
        >
            {children}
        </Button>
    );
};

export default NavButton;
