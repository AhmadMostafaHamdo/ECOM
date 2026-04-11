import { MessageSquare } from 'lucide-react';

const AdminChatHeader = ({ conversations, account }) => {
    return (
        <div className="admin-chat-header">
            <div className="admin-chat-header-left">
                <MessageSquare size={28} color="#ff9d00" />

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
    );
};

export default AdminChatHeader;
