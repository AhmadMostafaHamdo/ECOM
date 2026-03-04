import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Logincontext } from '../context/Contextprovider';
import { apiUrl } from '../../api';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import StorefrontIcon from '@mui/icons-material/Storefront';
import './admin-chat.css';

const AdminChat = () => {
    const { account } = useContext(Logincontext);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const pollRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = useCallback(async () => {
        try {
            const res = await fetch(apiUrl('/conversations'), {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        } finally {
            setLoading(false);
        }
    }, []);

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

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, [fetchConversations]);

    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation._id);
            pollRef.current = setInterval(() => {
                fetchMessages(activeConversation._id);
            }, 3000);
            return () => clearInterval(pollRef.current);
        }
    }, [activeConversation, fetchMessages]);

    const openConversation = async (conv) => {
        setActiveConversation(conv);
        await fetchMessages(conv._id);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || sending) return;

        const textToSend = newMessage.trim();
        setNewMessage('');
        setSending(true);

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
            }
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    const getOtherParticipant = (conv) => {
        if (!conv?.participants || !account) return { fname: 'User' };
        return conv.participants.find(p => p._id !== account._id) || conv.participants[0] || { fname: 'User' };
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now - d;
        if (diff < 60000) return 'الآن';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} د`;
        if (diff < 86400000) return d.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString('ar');
    };

    if (loading) {
        return (
            <div className="admin-chat-loading">
                <div className="admin-chat-spinner" />
                <p>جاري تحميل المحادثات...</p>
            </div>
        );
    }

    return (
        <div className="admin-chat-wrapper">
            {/* Header */}
            <div className="admin-chat-header">
                <div className="admin-chat-header-left">
                    <ChatIcon />
                    <div>
                        <h1>Live Chat</h1>
                        <p>التواصل مع أصحاب المنتجات</p>
                    </div>
                </div>
                <div className="admin-chat-stats">
                    <span className="chat-stat-badge">
                        {conversations.length} محادثة
                    </span>
                    <span className="chat-stat-badge online">
                        {conversations.filter(c => {
                            const myUnread = c.unreadCount?.[account?._id] || 0;
                            return myUnread > 0;
                        }).length} غير مقروءة
                    </span>
                </div>
            </div>

            <div className="admin-chat-body">
                {/* Conversations List */}
                <div className={`admin-chat-sidebar ${activeConversation ? 'mobile-hidden' : ''}`}>
                    <div className="admin-chat-sidebar-title">
                        <PersonIcon />
                        <span>المحادثات</span>
                    </div>

                    {conversations.length === 0 ? (
                        <div className="admin-chat-empty">
                            <ChatIcon className="empty-icon" />
                            <h3>لا توجد محادثات</h3>
                            <p>ستظهر المحادثات هنا عندما يتواصل معك المستخدمون</p>
                        </div>
                    ) : (
                        <div className="admin-conv-list">
                            {conversations.map((conv) => {
                                const other = getOtherParticipant(conv);
                                const myUnread = conv.unreadCount?.[account?._id] || 0;
                                const isActive = activeConversation?._id === conv._id;

                                return (
                                    <button
                                        key={conv._id}
                                        className={`admin-conv-item ${isActive ? 'active' : ''}`}
                                        onClick={() => openConversation(conv)}
                                    >
                                        <div className="admin-conv-avatar">
                                            {other.fname?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="admin-conv-info">
                                            <div className="admin-conv-name-row">
                                                <span className="admin-conv-name">{other.fname}</span>
                                                <span className="admin-conv-time">
                                                    {conv.lastMessage?.createdAt && formatTime(conv.lastMessage.createdAt)}
                                                </span>
                                            </div>
                                            <p className="admin-conv-preview">
                                                {conv.lastMessage?.text || 'لا توجد رسائل'}
                                            </p>
                                            {conv.productId && (
                                                <span className="admin-conv-product-tag">
                                                    <StorefrontIcon style={{ fontSize: 10 }} />
                                                    منتج
                                                </span>
                                            )}
                                        </div>
                                        {myUnread > 0 && (
                                            <span className="admin-conv-badge">{myUnread > 9 ? '9+' : myUnread}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Messages Panel */}
                <div className={`admin-messages-panel ${!activeConversation ? 'mobile-hidden' : ''}`}>
                    {activeConversation ? (
                        <>
                            {/* Message Header */}
                            <div className="admin-msg-header">
                                <button
                                    className="admin-msg-back"
                                    onClick={() => setActiveConversation(null)}
                                >
                                    <ArrowBackIcon fontSize="small" />
                                </button>
                                <div className="admin-msg-avatar-large">
                                    {getOtherParticipant(activeConversation).fname?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="admin-msg-user-info">
                                    <h3>{getOtherParticipant(activeConversation).fname}</h3>
                                    <span>{getOtherParticipant(activeConversation).email}</span>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="admin-messages-area">
                                {messages.length === 0 ? (
                                    <div className="admin-messages-empty">
                                        <ChatIcon />
                                        <p>ابدأ المحادثة الآن</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMine = msg.senderId?._id === account?._id || msg.senderId === account?._id;
                                        return (
                                            <div
                                                key={msg._id}
                                                className={`admin-msg-bubble-wrap ${isMine ? 'mine' : 'theirs'}`}
                                            >
                                                {!isMine && (
                                                    <div className="admin-msg-sender-avatar">
                                                        {msg.senderId?.fname?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                <div className="admin-msg-bubble">
                                                    <p>{msg.text}</p>
                                                    <span className="admin-msg-time">{formatTime(msg.createdAt)}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form className="admin-msg-input-area" onSubmit={sendMessage}>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="اكتب رسالتك هنا..."
                                    className="admin-msg-input"
                                    id="admin-chat-message-input"
                                    disabled={sending}
                                />
                                <button
                                    type="submit"
                                    className="admin-msg-send-btn"
                                    disabled={!newMessage.trim() || sending}
                                >
                                    <SendIcon />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="admin-messages-placeholder">
                            <ChatIcon className="placeholder-icon" />
                            <h2>اختر محادثة</h2>
                            <p>اختر محادثة من القائمة على اليسار للبدء</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminChat;
