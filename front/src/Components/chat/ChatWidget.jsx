import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Logincontext } from '../context/Contextprovider';
import { useChatContext } from '../context/ChatContext';
import { apiUrl } from '../../api';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './ChatWidget.css';

const ChatWidget = () => {
    const { account } = useContext(Logincontext);
    const { isOpen, setIsOpen, pendingConversation, clearPending } = useChatContext();

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    const accountId = account?._id;

    // Initialize Global Socket
    useEffect(() => {
        socketRef.current = io(apiUrl('/').replace(/\/$/, ""), {
            withCredentials: true
        });
        if (accountId) {
            socketRef.current.emit("user_online", accountId);
        }
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [accountId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchUnreadCount = useCallback(async () => {
        if (!accountId) return;
        try {
            const res = await fetch(apiUrl('/conversations/unread/count'), {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (err) {
            // silent
        }
    }, [accountId]);

    const fetchConversations = useCallback(async () => {
        if (!accountId) return;
        try {
            const res = await fetch(apiUrl('/conversations'), {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
                return data;
            }
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        }
        return [];
    }, [accountId]);

    const fetchMessages = useCallback(async (convId) => {
        try {
            const res = await fetch(apiUrl(`/conversations/${convId}/messages`), {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setMessages((data.messages || []).slice().reverse());
                setTimeout(scrollToBottom, 100);
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    }, []);

    // When widget opens: fetch conversations
    useEffect(() => {
        if (isOpen && accountId) {
            fetchConversations();
            fetchUnreadCount();
        }
    }, [isOpen, accountId, fetchConversations, fetchUnreadCount]);

    // Poll unread count in background
    useEffect(() => {
        if (accountId) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 15000);
            return () => clearInterval(interval);
        }
    }, [accountId, fetchUnreadCount]);

    // Handle pending conversation from "Chat with Seller" button
    useEffect(() => {
        if (pendingConversation && accountId) {
            setIsOpen(true);
            fetchConversations().then((convList) => {
                // Find the conversation in the list by _id
                const found = convList?.find(c => c._id === pendingConversation._id);
                const conv = found || pendingConversation;
                setActiveConversation(conv);
                fetchMessages(conv._id);
                clearPending();
            });
        }
    }, [pendingConversation, accountId, fetchConversations, fetchMessages, clearPending, setIsOpen]);

    // Join socket room and listen for real-time messages when active
    useEffect(() => {
        if (activeConversation && socketRef.current) {
            fetchMessages(activeConversation._id);

            const socket = socketRef.current;
            socket.emit("join_conversation", activeConversation._id);

            const handleMessage = (data) => {
                if (data.conversationId === activeConversation._id) {
                    fetchMessages(activeConversation._id);
                    fetchConversations();
                }
            };

            socket.on("receive_message", handleMessage);

            return () => {
                socket.emit("leave_conversation", activeConversation._id);
                socket.off("receive_message", handleMessage);
            };
        }
    }, [activeConversation, fetchMessages, fetchConversations]);

    const openConversation = async (conv) => {
        setActiveConversation(conv);
        setLoading(true);
        await fetchMessages(conv._id);
        setLoading(false);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        const textToSend = newMessage.trim();
        setNewMessage('');

        try {
            const res = await fetch(apiUrl(`/conversations/${activeConversation._id}/messages`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ text: textToSend }),
            });

            if (res.ok) {
                const msg = await res.json();
                setMessages(prev => [...prev, msg]);
                setTimeout(scrollToBottom, 100);
                fetchConversations();

                if (socketRef.current) {
                    socketRef.current.emit("send_message", {
                        conversationId: activeConversation._id,
                        message: msg
                    });
                }
            }
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const getOtherParticipant = (conv) => {
        if (!conv?.participants || !account) return { fname: 'User' };
        return conv.participants.find(p => p._id !== account._id) || conv.participants[0] || { fname: 'User' };
    };

    const getTimeLabel = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now - d;
        if (diff < 60000) return 'الآن';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} د`;
        if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString();
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setActiveConversation(null);
    };

    if (!account) return null;

    return (
        <div className="chat-widget">
            {/* Floating Button */}
            <button
                className={`chat-fab ${isOpen ? 'active' : ''}`}
                onClick={handleToggle}
                id="chat-toggle-btn"
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}
                {!isOpen && unreadCount > 0 && (
                    <span className="chat-fab-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="chat-panel">
                    <div className="chat-panel-header">
                        {activeConversation ? (
                            <>
                                <button className="chat-back-btn" onClick={() => { setActiveConversation(null); fetchConversations(); }}>
                                    <ArrowBackIcon fontSize="small" />
                                </button>
                                <div className="chat-header-info">
                                    <div className="chat-header-avatar">
                                        {getOtherParticipant(activeConversation).fname?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <h4>{getOtherParticipant(activeConversation).fname}</h4>
                                        <span className="chat-header-status">● متصل</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="chat-header-info">
                                <ChatIcon />
                                <h4>الرسائل</h4>
                            </div>
                        )}
                    </div>

                    <div className="chat-panel-body">
                        {activeConversation ? (
                            <div className="chat-messages-view">
                                <div className="chat-messages">
                                    {messages.length === 0 && !loading && (
                                        <div className="chat-empty-messages">
                                            <ChatIcon style={{ fontSize: 36, opacity: 0.3 }} />
                                            <p>ابدأ المحادثة الآن!</p>
                                        </div>
                                    )}
                                    {messages.map((msg) => (
                                        <div
                                            key={msg._id}
                                            className={`chat-message ${msg.senderId?._id === accountId || msg.senderId === accountId ? 'sent' : 'received'}`}
                                        >
                                            <div className="chat-bubble">
                                                <p>{msg.text}</p>
                                                <span className="chat-time">{getTimeLabel(msg.createdAt)}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                <form className="chat-input-area" onSubmit={sendMessage}>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="اكتب رسالتك..."
                                        className="chat-input"
                                        id="chat-message-input"
                                        autoFocus
                                    />
                                    <button type="submit" className="chat-send-btn" disabled={!newMessage.trim()}>
                                        <SendIcon fontSize="small" />
                                    </button>
                                </form>
                            </div>

                        ) : (
                            <div className="chat-conversations-list">
                                {conversations.length === 0 ? (
                                    <div className="chat-empty">
                                        <ChatIcon className="chat-empty-icon" />
                                        <p>لا توجد محادثات</p>
                                        <span>اضغط على "تواصل مع البائع" في أي منتج لبدء محادثة</span>
                                    </div>
                                ) : (
                                    conversations.map((conv) => {
                                        const other = getOtherParticipant(conv);
                                        const myUnread = conv.unreadCount?.[accountId] || 0;
                                        return (
                                            <button
                                                key={conv._id}
                                                className="chat-conv-item"
                                                onClick={() => openConversation(conv)}
                                            >
                                                <div className="chat-conv-avatar">
                                                    {other.fname?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="chat-conv-info">
                                                    <div className="chat-conv-name">
                                                        <span>{other.fname}</span>
                                                        <span className="chat-conv-time">
                                                            {conv.lastMessage?.createdAt && getTimeLabel(conv.lastMessage.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="chat-conv-last">
                                                        {conv.lastMessage?.text || 'لا توجد رسائل بعد'}
                                                    </p>
                                                </div>
                                                {myUnread > 0 && (
                                                    <span className="chat-conv-badge">{myUnread}</span>
                                                )}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
