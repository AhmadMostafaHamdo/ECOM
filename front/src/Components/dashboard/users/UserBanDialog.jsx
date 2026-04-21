import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

const UserBanDialog = ({
  banDialogOpen,
  setBanDialogOpen,
  banTarget,
  banReason,
  setBanReason,
  handleBanUser,
  banning,
}) => {
  const { t } = useTranslation();

  const handleOpenChange = (nextOpen) => {
    if (!banning) {
      setBanDialogOpen(nextOpen);
    }
  };

  return (
    <Dialog open={banDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="dialog-shell--compact admin_dialog_content">
        <DialogHeader>
          <DialogTitle>{t("admin.banUser")}</DialogTitle>
          <DialogDescription>
            {t("admin.banConfirm", { name: banTarget?.fname })}
          </DialogDescription>
        </DialogHeader>

        <div className="admin-form">
          <div className="admin-form__field admin-form__field--full">
            <label className="admin-form__label" htmlFor="ban-reason">
              {t("admin.banReason")}
            </label>
            <textarea
              id="ban-reason"
              value={banReason}
              onChange={(event) => setBanReason(event.target.value)}
              placeholder={t("admin.banPlaceholder")}
              className="admin_textarea"
            />
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            className="ui-button ui-button--ghost"
            disabled={banning}
            onClick={() => setBanDialogOpen(false)}
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className="ui-button ui-button--danger"
            onClick={handleBanUser}
            disabled={banning}
          >
            {banning ? <span className="ui-button__spinner" /> : null}
            <span>{banning ? t("admin.banning") : t("admin.confirmBan")}</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(UserBanDialog);
