import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Logincontext } from '../context/Contextprovider';
import { apiUrl } from '../../api';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import StorefrontIcon from '@mui/icons-material/Storefront';
import './admin-chat.css';
import AdminChatHeader from './components/AdminChatHeader';
import AdminChatSidebar from './components/AdminChatSidebar';
import AdminMessagesPanel from './components/AdminMessagesPanel';
const AdminChat = () => {
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
        socketRef.current = io(apiUrl('/').replace(/\/$/, ""), {
            withCredentials: true
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
