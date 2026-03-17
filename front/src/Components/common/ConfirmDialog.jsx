import React from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import Button from "./Button";

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
  const iconColor =
    type === "danger" ? "#ef4444" : type === "warning" ? "#f5a623" : "#6366f1";

  const handleOpenChange = (isOpen) => {
    if (!isOpen && !loading) {
      onCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="admin_dialog_content text-center" style={{ maxWidth: '420px' }}>
        <DialogHeader className="flex-col-center">
          <div
            className="w-14 h-14 rounded-2xl flex-col-center justify-center mb-4"
            style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
          >
            <AlertTriangle size={28} />
          </div>
          <DialogTitle className="text-xl font-extrabold text-center">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <p className="text-sm text-slate-700 leading-relaxed">
            {message}
          </p>
        </div>

        <DialogFooter className="flex gap-3 justify-center mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn-ghost px-6 py-2.5 font-bold"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-2.5 rounded-lg font-bold text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 ${
              type === "danger" 
                ? "bg-[#ef4444] shadow-red-200" 
                : type === "warning"
                ? "bg-[#f5a623] shadow-orange-200"
                : "bg-[#6366f1] shadow-indigo-200"
            }`}
          >
            {loading ? "..." : confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
