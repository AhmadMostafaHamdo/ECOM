import React from 'react';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
    );
};

export default AdminMessagesPanel;
