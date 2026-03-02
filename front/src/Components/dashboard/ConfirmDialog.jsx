import React from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";

const toneIconMap = {
  danger: <DeleteForeverRoundedIcon style={{ fontSize: 26 }} />,
  warning: <WarningAmberRoundedIcon style={{ fontSize: 26 }} />,
  logout: <LogoutRoundedIcon style={{ fontSize: 26 }} />
};

const ConfirmDialog = ({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "warning",
  onConfirm,
  onClose
}) => {
  if (!open) return null;

  const icon = toneIconMap[tone] || toneIconMap.warning;

  return (
    <div className="confirm-backdrop">
      <div className="confirm-dialog">
        <button className="confirm-close" onClick={onClose} aria-label="Close confirmation dialog">
          <CloseRoundedIcon style={{ fontSize: 20 }} />
        </button>

        <div className={`confirm-icon ${tone}`}>{icon}</div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-description">{description}</p>

        <div className="confirm-actions">
          <button className="btn-ghost" onClick={onClose}>
            {cancelLabel}
          </button>
          <button className={tone === "danger" ? "btn-delete" : "btn-primary"} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
