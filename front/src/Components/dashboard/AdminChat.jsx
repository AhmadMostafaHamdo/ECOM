import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Logincontext } from '../context/Contextprovider';
import { axiosInstance } from '../../api';
import { 
    MessageSquare, 
    Send, 
    ChevronLeft, 
    User, 
    Store,
    Clock,
    Search,
    MoreVertical,
    Activity
} from 'lucide-react';
import './admin-chat.css';
import AdminChatHeader from './components/AdminChatHeader';
import AdminChatSidebar from './components/AdminChatSidebar';
import AdminMessagesPanel from './components/AdminMessagesPanel';
import { useTranslation } from 'react-i18next';


const AdminChat = () => {
    const { t, i18n } = useTranslation();
    const { account } = useContext(Logincontext);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    // Initialize Global Socket
    useEffect(() => {
        const socketUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5007').replace(/\/$/, '');
        socketRef.current = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });
        if (account) {
            socketRef.current.emit("user_online", account._id);
        }
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [account]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/conversations');
            if (res.status === 200) {
                setConversations(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMessages = useCallback(async (convId) => {
        try {
            const res = await axiosInstance.get(`/conversations/${convId}/messages`);
            if (res.status === 200) {
                setMessages((res.data.messages || []).slice().reverse());
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
        await fetchMessages(conv._id);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || sending) return;

        const textToSend = newMessage.trim();
        setNewMessage('');
        setSending(true);

        try {
            const res = await axiosInstance.post(`/conversations/${activeConversation._id}/messages`, {
                text: textToSend
            });

            if (res.status === 200 || res.status === 201) {
                const msg = res.data;
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
        const locale = i18n.language === "ar" ? "ar" : "en";

        if (diff < 60000) return t('adminChat.now');
        if (diff < 3600000) {
            const mins = Math.floor(diff / 60000);
            return t('adminChat.minutes', { count: mins });
        }
        if (diff < 86400000) return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString(locale);
    };

    if (loading) {
        return (
            <div className="admin-chat-loading">
                <div className="admin-chat-spinner" />
                <p>{t('adminChat.loadingConversations')}</p>
            </div>
        );
    }

    return (
        <div className="admin-chat-wrapper" style={{ direction: i18n.dir() }}>
            <AdminChatHeader
                conversations={conversations}
                account={account}
            />

            <div className="admin-chat-body">
                <AdminChatSidebar
                    conversations={conversations}
                    activeConversation={activeConversation}
                    openConversation={openConversation}
                    account={account}
                    getOtherParticipant={getOtherParticipant}
                    formatTime={formatTime}
                />

                <AdminMessagesPanel
                    activeConversation={activeConversation}
                    setActiveConversation={setActiveConversation}
                    messages={messages}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    sendMessage={sendMessage}
                    sending={sending}
                    messagesEndRef={messagesEndRef}
                    getOtherParticipant={getOtherParticipant}
                    formatTime={formatTime}
                    account={account}
                />
            </div>
        </div>
    );
};

export default AdminChat;
