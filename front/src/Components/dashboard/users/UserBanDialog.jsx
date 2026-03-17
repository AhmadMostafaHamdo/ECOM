import React from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";

const UserBanDialog = ({
    banDialogOpen, setBanDialogOpen,
    banTarget,
    banReason, setBanReason,
    handleBanUser, banning
}) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === "rtl";

    const handleOpenChange = (open) => {
        if (!banning) setBanDialogOpen(open);
    };

    return (
        <Dialog open={banDialogOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="admin_dialog_content" style={{ maxWidth: '448px' }}>
                <DialogHeader>
                    <DialogTitle>{t("admin.banUser")}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 my-2">
                    <p className="text-sm text-slate-500 leading-relaxed">
                        {t("admin.banConfirm", { name: banTarget?.fname })}
                    </p>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">
                            {t("admin.banReason")}
                        </label>
                        <input
                            type="text"
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            placeholder={t("admin.banPlaceholder")}
                            className="admin_input text-sm"
                            style={{ textAlign: isRtl ? "right" : "left" }}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <button
                        onClick={() => setBanDialogOpen(false)}
                        className="btn-ghost text-sm font-bold"
                        disabled={banning}
                    >
                        {t("common.cancel")}
                    </button>
                    <button
                        onClick={handleBanUser}
                        disabled={banning}
                        className="btn_primary shadow-red-200"
                        style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                    >
                        {banning ? t("admin.banning") : t("admin.confirmBan")}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default React.memo(UserBanDialog);
