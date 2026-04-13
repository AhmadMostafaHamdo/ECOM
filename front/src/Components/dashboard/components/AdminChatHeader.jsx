import React from 'react';
import { MessageSquare, Activity, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminChatHeader = ({ conversations, account }) => {
    const { t } = useTranslation();
    const unreadCount = conversations.reduce((acc, conv) => {
        return acc + (conv.unreadCount?.[account?._id] || 0);
    }, 0);

    return (
        <div className="admin-chat-header">
            <div className="admin-chat-header-left">
                <div style={{ 
                    background: 'var(--primary-glow)', 
                    padding: '12px', 
                    borderRadius: '16px',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <MessageSquare size={32} />
                </div>
                <div style={{ marginLeft: '1rem' }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {t('adminChat.customerSupport')}
                        <ShieldCheck size={20} style={{ color: 'var(--info)' }} />
                    </h1>
                    <p>{t('adminChat.supportSub')}</p>
                </div>
            </div>
            <div className="chat-stats-group">
                <div className="chat-stat-badge">
                    <Activity size={14} />
                    {conversations.length} {t('adminChat.activeThreads')}
                </div>
                {unreadCount > 0 && (
                    <div className="chat-stat-badge online">
                        {unreadCount} {t('adminChat.unreadMessages')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChatHeader;
