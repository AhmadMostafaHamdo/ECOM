import React from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";

const toneIconMap = {
  danger: <DeleteForeverRoundedIcon style={{ fontSize: 26 }} />,
  warning: <WarningAmberRoundedIcon style={{ fontSize: 26 }} />,
  logout: <LogoutRoundedIcon style={{ fontSize: 26 }} />,
  info: <WarningAmberRoundedIcon style={{ fontSize: 26 }} />
};

/**
 * Generic dialog that can be positioned in different areas of the viewport.
 * placement: "center" (default), "top", "bottom", "left", "right".
 */
const DialogComponent = ({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "warning",
  placement = "center",
  onConfirm,
  onClose
}) => {
  if (!open) return null;

  const icon = toneIconMap[tone] || toneIconMap.info;

  return (
    <div className="dialog-backdrop" data-placement={placement}>
      <div className="dialog-panel">
        <button className="dialog-close" onClick={onClose} aria-label="Close dialog">
          <CloseRoundedIcon style={{ fontSize: 20 }} />
        </button>

        <div className={`dialog-icon ${tone}`}>{icon}</div>
        <h3 className="dialog-title">{title}</h3>
        <p className="dialog-description">{description}</p>

        <div className="dialog-actions">
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

export default DialogComponent;
