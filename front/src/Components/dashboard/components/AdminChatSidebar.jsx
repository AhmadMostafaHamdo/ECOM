import React, { useState, useMemo } from 'react';
import { User, MessageSquare, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminChatSidebar = ({
    conversations,
    activeConversation,
    openConversation,
    account,
    getOtherParticipant,
    formatTime,
    userSearchResults,
    isSearchingUsers,
    searchUsers,
    startConversationWithUser
}) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('recent'); // 'recent' or 'users'

    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim() || activeTab === 'users') return conversations;
        return conversations.filter(conv => {
            const other = getOtherParticipant(conv);
            const fullName = `${other.fname} ${other.lname || ''}`.toLowerCase();
            return fullName.includes(searchQuery.toLowerCase());
        });
    }, [conversations, searchQuery, getOtherParticipant, activeTab]);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (activeTab === 'users') {
            searchUsers(query);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchQuery('');
        if (tab === 'users') {
            searchUsers('');
        }
    };

    return (
        <div className={`admin-chat-sidebar ${activeConversation ? 'mobile-hidden' : ''}`}>
            <div className="admin-chat-tabs">
                <button
                    className={`chat-tab ${activeTab === 'recent' ? 'active' : ''}`}
                    onClick={() => handleTabChange('recent')}
                >
                    {t('adminChat.recent', 'Recent')}
                </button>
                <button
                    className={`chat-tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => handleTabChange('users')}
                >
                    {t('adminChat.findUsers', 'Find Users')}
                </button>
            </div>

            <div className="admin-chat-search-wrap">
                <div style={{ position: 'relative' }}>
                    <Search
                        size={16}
                        style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-3)'
                        }}
                    />
                    <input
                        type="text"
                        placeholder={activeTab === 'recent' ? t('adminChat.searchConversations') : t('adminChat.searchUsersPrompt', 'Search users by name or email...')}
                        className="admin-chat-search"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            {activeTab === 'recent' ? (
                filteredConversations.length === 0 ? (
                    <div className="admin-chat-empty" style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.6 }}>
                        <MessageSquare size={48} style={{ marginBottom: '1rem', color: 'var(--border-strong)' }} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-1)' }}>{t('adminChat.noConversations')}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-2)' }}>{t('adminChat.noMatches')}</p>
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
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
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
            ) : (
                <div className="admin-user-search-list">
                    {isSearchingUsers ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <div className="admin-chat-spinner" style={{ width: '24px', height: '24px', margin: '0 auto 10px' }} />
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>{t('common.searching', 'Searching...')}</p>
                        </div>
                    ) : userSearchResults.length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.6 }}>
                            <User size={48} style={{ marginBottom: '1rem', color: 'var(--border-strong)' }} />
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-2)' }}>
                                {t('adminChat.noUsersAvailable', 'No users available at the moment')}
                            </p>
                        </div>
                    ) : (
                        <div className="admin-conv-list">
                            {userSearchResults.map((user) => (
                                <button
                                    key={user._id}
                                    className="admin-conv-item"
                                    onClick={() => startConversationWithUser(user._id)}
                                >
                                    <div className="admin-conv-avatar-wrap">
                                        <div className="admin-conv-avatar">
                                            {user.fname?.[0]?.toUpperCase() || <User size={20} />}
                                        </div>
                                    </div>
                                    <div className="admin-conv-info">
                                        <div className="admin-conv-header">
                                            <span className="admin-conv-name">{user.fname} {user.lname}</span>
                                        </div>
                                        <p className="admin-conv-preview">{user.email}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminChatSidebar;
