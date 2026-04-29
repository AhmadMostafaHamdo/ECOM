import React, { useState, useMemo } from 'react';
import { User, MessageSquare, Search, Users as UsersIcon, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminChatSidebar = ({
    conversations,
    users = [],
    usersLoading = false,
    startingChat = false,
    startConversationWithUser,
    activeConversation,
    openConversation,
    account,
    getOtherParticipant,
    formatTime
}) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('conversations');

    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        return conversations.filter(conv => {
            const other = getOtherParticipant(conv);
            const fullName = `${other.fname || ''} ${other.lname || ''}`.toLowerCase();
            return fullName.includes(searchQuery.toLowerCase());
        });
    }, [conversations, searchQuery, getOtherParticipant]);

    const filteredUsers = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return users;
        return users.filter(u => {
            const haystack = `${u.fname || ''} ${u.lname || ''} ${u.email || ''}`.toLowerCase();
            return haystack.includes(q);
        });
    }, [users, searchQuery]);

    const conversationUserIds = useMemo(() => {
        const ids = new Set();
        conversations.forEach(c => {
            (c.participants || []).forEach(p => {
                const id = p?._id || p;
                if (id && id !== account?._id) ids.add(id);
            });
        });
        return ids;
    }, [conversations, account]);

    const placeholder = activeTab === 'users'
        ? (t('adminChat.searchUsers') || 'Search users...')
        : t('adminChat.searchConversations');

    return (
        <div className={`admin-chat-sidebar ${activeConversation ? 'mobile-hidden' : ''}`}>
            <div className="admin-chat-tabs" role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'conversations'}
                    className={`admin-chat-tab ${activeTab === 'conversations' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('conversations')}
                >
                    <MessageSquare size={16} />
                    <span>{t('adminChat.tabConversations') || t('adminChat.activeThreads')}</span>
                    <span className="admin-chat-tab-count">{conversations.length}</span>
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'users'}
                    className={`admin-chat-tab ${activeTab === 'users' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <UsersIcon size={16} />
                    <span>{t('adminChat.tabAllUsers') || 'All users'}</span>
                    <span className="admin-chat-tab-count">{users.length}</span>
                </button>
            </div>

            <div className="admin-chat-search-wrap">
                <div className="admin-chat-search-field">
                    <Search size={16} className="admin-chat-search-icon" />
                    <input
                        type="text"
                        placeholder={placeholder}
                        className="admin-chat-search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {activeTab === 'conversations' && (
                filteredConversations.length === 0 ? (
                    <div className="admin-chat-empty">
                        <MessageSquare size={48} className="admin-chat-empty-icon" />
                        <h3>{t('adminChat.noConversations')}</h3>
                        <p>{t('adminChat.noMatches')}</p>
                    </div>
                ) : (
                    <div className="admin-conv-list">
                        {filteredConversations.map((conv) => {
                            const other = getOtherParticipant(conv);
                            const myUnread = conv.unreadCount?.[account?._id] || 0;
                            const isActive = activeConversation?._id === conv._id;
                            const lastMsg = conv.lastMessage;

                            return (
                                <button
                                    key={conv._id}
                                    type="button"
                                    className={`admin-conv-item ${isActive ? 'active' : ''}`}
                                    onClick={() => openConversation(conv)}
                                >
                                    <div className="admin-conv-avatar-wrap">
                                        <div className="admin-conv-avatar">
                                            {other.fname?.[0]?.toUpperCase() || <User size={20} />}
                                        </div>
                                        <div className="online-dot" />
                                    </div>
                                    <div className="admin-conv-info">
                                        <div className="admin-conv-header">
                                            <span className="admin-conv-name">{other.fname} {other.lname}</span>
                                            <span className="admin-conv-time">
                                                {lastMsg?.createdAt && formatTime(lastMsg.createdAt)}
                                            </span>
                                        </div>
                                        <div className="admin-conv-bottom">
                                            <p className="admin-conv-preview">
                                                {lastMsg?.text || t('adminChat.noMessages')}
                                            </p>
                                            {myUnread > 0 && (
                                                <span className="unread-badge">{myUnread > 9 ? '9+' : myUnread}</span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )
            )}

            {activeTab === 'users' && (
                usersLoading ? (
                    <div className="admin-chat-empty">
                        <Loader2 size={32} className="admin-chat-empty-icon spinning" />
                        <p>{t('common.loading') || 'Loading...'}</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="admin-chat-empty">
                        <UsersIcon size={48} className="admin-chat-empty-icon" />
                        <h3>{t('adminChat.noUsers') || 'No users'}</h3>
                        <p>{t('adminChat.noMatches')}</p>
                    </div>
                ) : (
                    <div className="admin-user-list">
                        {filteredUsers.map((user) => {
                            const hasConversation = conversationUserIds.has(user._id);
                            return (
                                <button
                                    key={user._id}
                                    type="button"
                                    className="admin-user-item"
                                    onClick={() => startConversationWithUser(user)}
                                    disabled={startingChat}
                                >
                                    <div className="admin-user-avatar">
                                        {user.fname?.[0]?.toUpperCase() || <User size={20} />}
                                    </div>
                                    <div className="admin-user-info">
                                        <span className="admin-user-name">
                                            {user.fname} {user.lname || ''}
                                        </span>
                                        <span className="admin-user-meta">
                                            {user.email || user.mobile}
                                        </span>
                                    </div>
                                    <span className={`admin-user-action ${hasConversation ? 'is-existing' : ''}`}>
                                        {hasConversation
                                            ? (t('adminChat.openChat') || t('adminChat.tabConversations') || 'Open')
                                            : (t('adminChat.startChat') || 'Start')}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )
            )}
        </div>
    );
};

export default AdminChatSidebar;
