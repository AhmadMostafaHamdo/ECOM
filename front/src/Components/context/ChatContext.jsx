import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [pendingConversation, setPendingConversation] = useState(null);

    // Open the chat widget and optionally jump to a specific conversation
    const openChat = useCallback((conversation = null) => {
        setIsOpen(true);
        if (conversation) {
            setPendingConversation(conversation);
        }
    }, []);

    const closeChat = useCallback(() => {
        setIsOpen(false);
        setPendingConversation(null);
    }, []);

    const clearPending = useCallback(() => {
        setPendingConversation(null);
    }, []);

    const value = useMemo(() => ({
        isOpen,
        setIsOpen,
        pendingConversation,
        openChat,
        closeChat,
        clearPending,
    }), [isOpen, pendingConversation, openChat, closeChat, clearPending]);

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error('useChatContext must be used inside ChatProvider');
    return ctx;
};

export default ChatProvider;
