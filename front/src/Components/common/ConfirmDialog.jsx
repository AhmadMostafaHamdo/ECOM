import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmDialog.css';
import Button from './Button';

/**
 * ConfirmDialog - A premium confirmation modal
 * Props:
 *  open: boolean
 *  title: string
 *  message: string
 *  confirmText: string
 *  cancelText: string
 *  onConfirm: () => void
 *  onCancel: () => void
 *  loading: boolean
 *  type: 'danger' | 'warning' | 'info'
 */
const ConfirmDialog = ({
    open,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    loading = false,
    type = 'danger'
}) => {
    if (!open) return null;

    const iconColor = type === 'danger' ? '#ef4444' : type === 'warning' ? '#f5a623' : '#6366f1';

    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-header">
                    <div className="confirm-icon-wrapper" style={{ backgroundColor: `${iconColor}15`, color: iconColor }}>
                        <AlertTriangle size={24} />
                    </div>
                    <button className="confirm-close-btn" onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>
                
                <div className="confirm-body">
                    <h3 className="confirm-title">{title}</h3>
                    <p className="confirm-message">{message}</p>
                </div>

                <div className="confirm-footer">
                    <Button 
                        variant="ghost" 
                        onClick={onCancel} 
                        disabled={loading}
                        className="confirm-cancel-btn"
                    >
                        {cancelText}
                    </Button>
                    <Button 
                        variant={type === 'danger' ? 'danger' : 'primary'} 
                        onClick={onConfirm} 
                        loading={loading}
                        className="confirm-action-btn"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
