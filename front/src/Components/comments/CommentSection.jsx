import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Logincontext } from '../context/Contextprovider';
import { apiUrl, getCookie } from '../../api';
import { toast } from 'react-toastify';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendIcon from '@mui/icons-material/Send';
import './CommentSection.css';
import ConfirmDialog from '../common/ConfirmDialog';

const CommentSection = ({ productId }) => {
    const { account } = useContext(Logincontext);
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [liking, setLiking] = useState({});
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch(apiUrl(`/comments/${productId}`));
            if (res.ok) {
                const data = await res.json();
                setComments(data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!account) { toast.error('Please login to comment'); return; }
        if (!text.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch(apiUrl('/comments'), {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-csrf-token': getCookie('csrfToken')
                },
                credentials: 'include',
                body: JSON.stringify({ productId, text: text.trim() }),
            });
            if (res.ok) {
                setText('');
                fetchComments();
                toast.success('Comment added!');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to add comment');
            }
        } catch (err) {
            toast.error('Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (parentId) => {
        if (!account) { toast.error('Please login to reply'); return; }
        if (!replyText.trim()) return;

        try {
            const res = await fetch(apiUrl('/comments'), {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-csrf-token': getCookie('csrfToken')
                },
                credentials: 'include',
                body: JSON.stringify({ productId, text: replyText.trim(), parentId }),
            });
            if (res.ok) {
                setReplyText('');
                setReplyingTo(null);
                fetchComments();
            }
        } catch (err) {
            toast.error('Failed to reply');
        }
    };

    const handleLike = async (commentId) => {
        if (!account) { toast.error('Please login to like'); return; }
        setLiking(prev => ({ ...prev, [commentId]: true }));
        try {
            const res = await fetch(apiUrl(`/comments/${commentId}/like`), {
                method: 'POST',
                headers: {
                    'x-csrf-token': getCookie('csrfToken')
                },
                credentials: 'include',
            });
            if (res.ok) {
                await fetchComments();
            }
        } catch (err) {
            console.error('Failed to like:', err);
        } finally {
            setLiking(prev => ({ ...prev, [commentId]: false }));
        }
    };

    const handleDelete = (commentId) => {
        setCommentToDelete(commentId);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!commentToDelete) return;
        
        setIsDeleting(true);
        try {
            const res = await fetch(apiUrl(`/comments/${commentToDelete}`), {
                method: 'DELETE',
                headers: {
                    'x-csrf-token': getCookie('csrfToken')
                },
                credentials: 'include',
            });
            if (res.ok) {
                await fetchComments();
                toast.success('Comment deleted');
                setIsConfirmOpen(false);
            }
        } catch (err) {
            toast.error('Failed to delete comment');
        } finally {
            setIsDeleting(false);
            setCommentToDelete(null);
        }
    };

    const getTimeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        return new Date(dateStr).toLocaleDateString();
    };

    return (
        <div className="comment-section" id="comments-section">
            <div className="comment-section-header">
                <h3>Comments</h3>
                <span className="comment-count">{comments.length}</span>
            </div>

            {/* Comment Input */}
            {account ? (
                <form className="comment-input-wrapper" onSubmit={handleSubmit}>
                    <div className="comment-input-avatar">
                        {account.fname?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="comment-input-field">
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Add a comment..."
                            maxLength={1000}
                            id="comment-input"
                        />
                        <button type="submit" disabled={!text.trim() || submitting} className="comment-submit-btn">
                            <SendIcon fontSize="small" />
                        </button>
                    </div>
                </form>
            ) : (
                <div className="comment-login-prompt">
                    <p>Please login to leave a comment</p>
                </div>
            )}

            {/* Comments List */}
            <div className="comment-list">
                {loading ? (
                    <div className="comment-skeleton">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="comment-skeleton-item">
                                <div className="skeleton-circle" />
                                <div className="skeleton-lines">
                                    <div className="skeleton-line short" />
                                    <div className="skeleton-line" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : comments.length === 0 ? (
                    <div className="comment-empty">
                        <p>No comments yet. Be the first!</p>
                    </div>
                ) : (
                    comments.map((comment) => {
                        const isLiked = account && comment.likedBy?.some(id => 
                            (id._id || id).toString() === account._id.toString()
                        );
                        const commentUserId = comment.userId?._id || comment.userId;
                        const isOwner = account && commentUserId && 
                                       commentUserId.toString() === account._id.toString();
                        return (
                            <div key={comment._id} className="comment-item">
                                <div className="comment-main">
                                    <div className="comment-avatar">
                                        {comment.userId?.fname?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="comment-content">
                                        <div className="comment-meta">
                                            <span className="comment-author">{comment.userId?.fname || 'Anonymous'}</span>
                                            <span className="comment-time">{getTimeAgo(comment.createdAt)}</span>
                                        </div>
                                        <p className="comment-text">{comment.text}</p>
                                        <div className="comment-actions">
                                            <button
                                                className={`comment-action-btn like-btn ${isLiked ? 'liked' : ''}`}
                                                onClick={() => handleLike(comment._id)}
                                                disabled={liking[comment._id]}
                                            >
                                                {liking[comment._id] ? (
                                                    <div className="mini-spinner" />
                                                ) : (
                                                    isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />
                                                )}
                                                <span>{comment.likeCount || 0}</span>
                                            </button>
                                            <button
                                                className="comment-action-btn reply-btn"
                                                onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                            >
                                                <ReplyIcon fontSize="small" />
                                                <span>Reply</span>
                                            </button>
                                            {isOwner && (
                                                <button
                                                    className="comment-action-btn delete-btn"
                                                    onClick={() => handleDelete(comment._id)}
                                                >
                                                    <DeleteOutlineIcon fontSize="small" style={{ color: "red" }} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Reply Input */}
                                        {replyingTo === comment._id && (
                                            <div className="reply-input-wrapper">
                                                <input
                                                    type="text"
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Write a reply..."
                                                    maxLength={1000}
                                                    autoFocus
                                                />
                                                <button onClick={() => handleReply(comment._id)} disabled={!replyText.trim()}>
                                                    <SendIcon fontSize="small" />
                                                </button>
                                            </div>
                                        )}

                                        {/* Replies */}
                                        {comment.replies?.length > 0 && (
                                            <div className="comment-replies">
                                                {comment.replies.map((reply) => {
                                                    const replyUserId = reply.userId?._id || reply.userId;
                                                    const isReplyOwner = account && replyUserId && 
                                                                       replyUserId.toString() === account._id.toString();
                                                    return (
                                                        <div key={reply._id} className="reply-item">
                                                            <div className="comment-avatar reply-avatar">
                                                                {reply.userId?.fname?.[0]?.toUpperCase() || 'U'}
                                                            </div>
                                                            <div className="reply-content">
                                                                <div className="comment-meta">
                                                                    <span className="comment-author">{reply.userId?.fname || 'Anonymous'}</span>
                                                                    <span className="comment-time">{getTimeAgo(reply.createdAt)}</span>
                                                                </div>
                                                                <p className="comment-text">{reply.text}</p>
                                                                {isReplyOwner && (
                                                                    <button
                                                                        className="comment-action-btn delete-btn"
                                                                        onClick={() => handleDelete(reply._id)}
                                                                    >
                                                                        <DeleteOutlineIcon fontSize="small" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            <ConfirmDialog 
                open={isConfirmOpen}
                title="Delete Comment"
                message="Are you sure you want to delete this comment? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setIsConfirmOpen(false);
                    setCommentToDelete(null);
                }}
                loading={isDeleting}
                type="danger"
            />
        </div>
    );
};

export default CommentSection;
