import React from 'react';
import { ChevronLeft, Send, MessageSquare, MoreHorizontal, Info, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const isRtl = document.documentElement.dir === 'rtl';
    const otherParticipant = activeConversation ? getOtherParticipant(activeConversation) : null;

    return (
        <div className={`admin-messages-panel ${!activeConversation ? 'mobile-hidden' : ''}`}>
            {activeConversation ? (
                <>
                    {/* Message Header */}
                    <div className="admin-msg-header">
                        <div className="admin-msg-header-left">
                            <button
                                className="admin-msg-back"
                                onClick={() => setActiveConversation(null)}
                            >
                                <ChevronLeft size={22} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
                            </button>
                            <div className="admin-conv-avatar admin-conv-avatar-sm">
                                {otherParticipant.fname?.[0]?.toUpperCase() || <User size={18} />}
                            </div>
                            <div className="admin-msg-user-info">
                                <h3>{otherParticipant.fname} {otherParticipant.lname}</h3>
                                <p>
                                    <span className="admin-msg-status-dot" />
                                    {t('adminChat.activeNow')}
                                </p>
                            </div>
                        </div>
                        <div className="admin-msg-header-actions">
                            <button className="admin-msg-header-btn">
                                <Info size={19} />
                            </button>
                            <button className="admin-msg-header-btn">
                                <MoreHorizontal size={19} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="admin-messages-area">
                        <AnimatePresence initial={false}>
                            {messages.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="admin-messages-empty"
                                    style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)' }}
                                >
                                    <MessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                    <p>{t('adminChat.startConversation', { name: otherParticipant.fname })}</p>
                                </motion.div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMine = msg.senderId?._id === account?._id || msg.senderId === account?._id;
                                    return (
                                        <motion.div
                                            key={msg._id || idx}
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                            className={`admin-msg-bubble-wrap ${isMine ? 'mine' : 'theirs'}`}
                                        >
                                            <div className="admin-msg-bubble">
                                                <span className="admin-msg-bubble-text">{msg.text}</span>
                                                <span className="admin-msg-time">{formatTime(msg.createdAt)}</span>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="admin-msg-input-area-wrap">
                        <form className="admin-msg-input-area" onSubmit={sendMessage}>
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage(e);
                                    }
                                }}
                                placeholder={t('adminChat.writeMessage')}
                                className="admin-msg-input"
                                rows={1}
                                disabled={sending}
                            />
                            <div className="admin-msg-actions">
                                <button
                                    type="submit"
                                    className="admin-msg-send-btn"
                                    disabled={!newMessage.trim() || sending}
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            ) : (
                <div className="admin-messages-placeholder">
                    <div className="placeholder-icon-wrap">
                        <MessageSquare size={48} />
                    </div>
                    <h2>{t('adminChat.noChatSelected')}</h2>
                    <p>{t('adminChat.chooseConversation')}</p>
                </div>
            )}
        </div>
    );
};

export default AdminMessagesPanel;
