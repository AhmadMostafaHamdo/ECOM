import { ChevronLeft, Send, MessageSquare } from 'lucide-react';

const AdminMessagesPanel = ({
    activeConversation,
    setActiveConversation,
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    sending,
    messagesEndRef,
    getOtherParticipant,
    formatTime,
    account
}) => {
    const isRtl = document.documentElement.dir === 'rtl';

    return (
        <div className={`admin-messages-panel ${!activeConversation ? 'mobile-hidden' : ''}`}>
            {activeConversation ? (
                <>
                    {/* Message Header */}
                    <div className="admin-msg-header">
                        <button
                            className="admin-msg-back"
                            onClick={() => setActiveConversation(null)}
                        >
                            <ChevronLeft size={20} style={{transform: isRtl ? 'rotate(180deg)' : 'none'}} />
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
                                <MessageSquare size={48} color="#cbd5e1" />
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
                            <Send size={20} />
                        </button>
                    </form>
                </>
            ) : (
                <div className="admin-messages-placeholder">
                    <MessageSquare size={64} className="placeholder-icon" />
                    <h2>اختر محادثة</h2>
                    <p>اختر محادثة من القائمة على اليسار للبدء</p>
                </div>
            )}
        </div>
    );
};


export default AdminMessagesPanel;
