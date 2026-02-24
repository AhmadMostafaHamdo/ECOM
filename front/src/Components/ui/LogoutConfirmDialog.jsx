"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { Button } from "./button"
import { useTranslation } from "react-i18next"
import { LogOut, AlertTriangle } from "lucide-react"

const LogoutConfirmDialog = ({ isOpen, onOpenChange, onConfirm, isLoading = false }) => {
  const { t } = useTranslation()

  const handleConfirm = () => {
    onConfirm?.()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center sm:justify-start">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {t("logout.confirmTitle", "Confirm Logout")}
          </DialogTitle>
          <DialogDescription className="text-center sm:text-left">
            {t("logout.confirmMessage", "Are you sure you want to logout? You will need to sign in again to access your account.")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
              <div className="text-sm text-orange-800 dark:text-orange-200">
                {t("logout.warning", "Any unsaved changes will be lost if you logout now.")}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {t("logout.cancel", "Cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t("logout.loggingOut", "Logging out...")}
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                {t("logout.confirm", "Logout")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LogoutConfirmDialog
