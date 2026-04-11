import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Logincontext } from '../context/Contextprovider';
import { useChatContext } from '../context/ChatContext';
import { ROOT_URL, axiosInstance } from '../../api';
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
    const [onlineUsers, setOnlineUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    const accountId = account?._id;

    // Initialize Global Socket
    useEffect(() => {
        socketRef.current = io(ROOT_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });
        if (accountId) {
            socketRef.current.emit("user_online", accountId);
        }
        socketRef.current.on("online_users", (users) => {
            setOnlineUsers(users || []);
        });
        return () => {
            if (socketRef.current) {
                socketRef.current.off("online_users");
                socketRef.current.disconnect();
            }
        };
    }, [accountId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchUnreadCount = useCallback(async (isBackground = false) => {
        if (!accountId) return;
        try {
            const res = await axiosInstance.get('/conversations/unread/count');
            if (res.status === 200) {
                setUnreadCount(res.data.unreadCount || 0);
            }
        } catch (err) {
            // silent
        }
    }, [accountId]);

    const fetchConversations = useCallback(async () => {
        if (!accountId) return;
        try {
            const res = await axiosInstance.get('/conversations');
            if (res.status === 200) {
                const data = res.data;
                const conversationsArray = Array.isArray(data) ? data : (data.data || data.conversations || []);
                setConversations(conversationsArray);
                return conversationsArray;
            }
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        }
        return [];
    }, [accountId]);

    const fetchMessages = useCallback(async (convId) => {
        try {
            const res = await axiosInstance.get(`/conversations/${convId}/messages`);
            if (res.status === 200) {
                const data = res.data;
                const messagesArray = Array.isArray(data.messages) ? data.messages : [];
                setMessages(messagesArray.slice().reverse());
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

    // Poll unread count in background (Fallback)
    useEffect(() => {
        if (accountId) {
            fetchUnreadCount(true);
            const interval = setInterval(() => fetchUnreadCount(true), 60000); // 1 minute is enough with socket updates
            return () => clearInterval(interval);
        }
    }, [accountId, fetchUnreadCount]);

    // Global real-time unread count updates
    useEffect(() => {
        if (socketRef.current) {
            const handleGlobalMessage = (data) => {
                // Only refresh if the message is from someone else
                const senderId = data.message?.senderId?._id || data.message?.senderId;
                if (senderId && senderId !== accountId) {
                    fetchUnreadCount(true);
                    if (isOpen && !activeConversation) {
                        fetchConversations();
                    }
                }
            };
            socketRef.current.on("receive_message", handleGlobalMessage);
            return () => socketRef.current.off("receive_message", handleGlobalMessage);
        }
    }, [isOpen, activeConversation, fetchUnreadCount, fetchConversations, accountId]);

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
            const res = await axiosInstance.post(`/conversations/${activeConversation._id}/messages`, {
                text: textToSend
            });

            if (res.status === 200 || res.status === 201) {
                const msg = res.data;
                setMessages(prev => [...prev, msg]);
                setTimeout(scrollToBottom, 100);

                // Emit socket event for real-time update
                if (socketRef.current) {
                    socketRef.current.emit("send_message", {
                        conversationId: activeConversation._id,
                        message: msg
                    });
                }

                fetchConversations();
                fetchUnreadCount(true);
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
                                        <span className={`chat-header-status ${onlineUsers.includes(getOtherParticipant(activeConversation)._id) ? 'online' : ''}`}>
                                            ● {onlineUsers.includes(getOtherParticipant(activeConversation)._id) ? 'متصل' : 'غير متصل'}
                                        </span>
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
                                {(!Array.isArray(conversations) || conversations.length === 0) ? (
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
