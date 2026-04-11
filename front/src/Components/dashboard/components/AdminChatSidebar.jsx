import { User, MessageSquare, Store } from 'lucide-react';

const AdminChatSidebar = ({
    conversations,
    activeConversation,
    openConversation,
    account,
    getOtherParticipant,
    formatTime
}) => {
    return (
        <div className={`admin-chat-sidebar ${activeConversation ? 'mobile-hidden' : ''}`}>
            <div className="admin-chat-sidebar-title">
                <User size={18} />
                <span>المحادثات</span>
            </div>


            {conversations.length === 0 ? (
                <div className="admin-chat-empty">
                    <MessageSquare size={48} className="empty-icon" />
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
                                            <Store size={10} />
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
    );
};

export default AdminChatSidebar;
