import React, { createContext, useState, useMemo } from 'react'

export const Logincontext = createContext(null);

const Contextprovider = ({ children }) => {
    const [account, setAccount] = useState("");
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
