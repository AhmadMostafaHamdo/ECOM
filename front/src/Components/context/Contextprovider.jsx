import React, { createContext, useState, useMemo } from 'react'

export const Logincontext = createContext(null);

/**
 * Restore auth state from localStorage on initial load.
 * This prevents the dashboard from flashing as "not logged in" on hard refresh.
 */
const getInitialAccount = () => {
    try {
        const savedUser = localStorage.getItem('authUser');
        const savedToken = localStorage.getItem('accessToken');
        // Only restore if both token and user data exist
        if (savedUser && savedToken && savedToken !== 'undefined' && savedToken !== 'null') {
            return JSON.parse(savedUser);
        }
    } catch {
        // Corrupted data — clean up
        localStorage.removeItem('authUser');
        localStorage.removeItem('accessToken');
    }
    return "";
};

const Contextprovider = ({ children }) => {
    const [account, setAccount] = useState(getInitialAccount);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const value = useMemo(() => ({ 
        account, 
        setAccount,
        showLoginPrompt,
        setShowLoginPrompt
    }), [account, showLoginPrompt]);

    return (
        <Logincontext.Provider value={value}>
            {children}
        </Logincontext.Provider>
    )
}

export default Contextprovider;
