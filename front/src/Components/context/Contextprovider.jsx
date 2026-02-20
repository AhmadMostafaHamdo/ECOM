import React, { createContext, useState, useMemo } from 'react'

export const Logincontext = createContext(null);

const Contextprovider = ({ children }) => {

    const [account, setAccount] = useState("");

    const value = useMemo(() => ({ account, setAccount }), [account]);

    return (
        <>
            <Logincontext.Provider value={value}>
                {children}
            </Logincontext.Provider>
        </>
    )
}

export default Contextprovider;
