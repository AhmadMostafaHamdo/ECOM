import React from "react";
import { AlertTriangle, ShieldAlert, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const iconMap = {
  danger: Trash2,
  warning: AlertTriangle,
  info: ShieldAlert,
};

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  type = "danger",
}) => {
  const Icon = iconMap[type] || AlertTriangle;

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen && !loading) {
      onCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="dialog-shell--compact admin_dialog_content">
        <DialogHeader className="dialog-stack">
          <span className={`dialog-tone dialog-tone--${type}`}>
            <Icon size={30} />
          </span>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <button type="button" className="ui-button ui-button--ghost" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`ui-button ${type === "danger" ? "ui-button--danger" : "ui-button--primary"}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <span className="ui-button__spinner" /> : null}
            <span>{confirmText}</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
