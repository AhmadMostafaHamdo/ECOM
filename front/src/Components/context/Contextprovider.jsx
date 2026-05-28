import React, { createContext, useState, useMemo, useCallback } from 'react'

export const Logincontext = createContext(null);

/**
 * Restore auth state from localStorage on initial load.
 * This prevents the dashboard from flashing as "not logged in" on hard refresh.
 */
const getInitialAccount = () => {
    try {
        const savedUser = localStorage.getItem('authUser');
        const savedToken = localStorage.getItem('accessToken');
        if (savedUser && savedToken && savedToken !== 'undefined' && savedToken !== 'null') {
            return JSON.parse(savedUser);
        }
    } catch {
        localStorage.removeItem('authUser');
        localStorage.removeItem('accessToken');
    }
    return "";
};

const Contextprovider = ({ children }) => {
    const [account, setAccount] = useState(getInitialAccount);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    // authReady starts as true if we restored from localStorage, false if no saved session
    const [authReady, setAuthReady] = useState(() => !!getInitialAccount());

    // Wrap setAccount so that whenever account is set, authReady becomes true
    const setAccountAndReady = useCallback((newAccount) => {
        setAccount(newAccount);
        setAuthReady(true);
    }, []);

    const value = useMemo(() => ({ 
        account, 
        setAccount: setAccountAndReady,
        authReady,
        setAuthReady,
        showLoginPrompt,
        setShowLoginPrompt
    }), [account, authReady, showLoginPrompt, setAccountAndReady]);

    return (
        <Logincontext.Provider value={value}>
            {children}
        </Logincontext.Provider>
    )
}

export default Contextprovider;
