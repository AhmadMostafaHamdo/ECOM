import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Plus, Share2, Smartphone, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const SHOW_DELAY_MS = 4000;

const PWAInstallPrompt = ({ pwaInstall }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [direction, setDirection] = useState("rtl");

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const root = document.documentElement;
    const syncDirection = () => setDirection(root.dir || "rtl");
    const observer = new MutationObserver(syncDirection);

    syncDirection();
    observer.observe(root, { attributes: true, attributeFilter: ["dir"] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (
      pwaInstall.isInstalled ||
      !pwaInstall.isInstallAvailable ||
      pwaInstall.hasSeenPrompt
    ) {
      setIsOpen(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setIsOpen(true);
    }, SHOW_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [
    pwaInstall.hasSeenPrompt,
    pwaInstall.isInstallAvailable,
    pwaInstall.isInstalled,
  ]);

  const handleLater = () => {
    pwaInstall.dismissPrompt();
    setIsOpen(false);
  };

  const handleInstall = async () => {
    await pwaInstall.installApp();
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1100] grid place-items-end bg-slate-950/45 p-4 backdrop-blur-md sm:place-items-center"
          dir={direction}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="presentation"
        >
          <motion.section
            className="w-full max-w-[430px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text-1)] shadow-[var(--shadow-floating)]"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-install-title"
          >
            <div className="flex items-start gap-4 border-b border-[var(--border)] p-5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-[var(--primary-soft)] text-[var(--primary)]">
                <Smartphone size={24} aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.08em] text-[var(--primary)]">
                  {t("pwa.appTitle", "Studio Commerce")}
                </p>
                <h2 id="pwa-install-title" className="text-lg font-extrabold leading-snug">
                  {t("pwa.installTitle", "Install our App")}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">
                  {t("pwa.installDesc", "Open the store quickly, use it as a standalone app, and enjoy a faster experience even with a weak connection.")}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLater}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--text-3)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text-1)]"
                aria-label="Close install prompt"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {pwaInstall.isIOSInstallCapable && (
              <div className="mx-5 mt-5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <div className="flex items-start gap-3 text-sm leading-6 text-[var(--text-2)]">
                  <Share2 className="mt-1 shrink-0 text-[var(--primary)]" size={18} aria-hidden="true" />
                  <p>
                    {t("pwa.iosInstructions", "On iPhone: Press Share → Add to Home Screen")}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 p-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleLater}
                className="min-h-11 rounded-[14px] border border-[var(--border)] px-5 text-sm font-bold text-[var(--text-2)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text-1)]"
              >
                {t("pwa.later", "Later")}
              </button>

              <button
                type="button"
                onClick={handleInstall}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border-2 border-transparent bg-[var(--primary)] px-6 text-sm font-extrabold text-white shadow-xl transition hover:-translate-y-1 hover:bg-[var(--primary-dark)] hover:border-[var(--primary-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pwaInstall.isIOSInstallCapable ? (
                  <Plus size={18} aria-hidden="true" />
                ) : (
                  <Download size={18} aria-hidden="true" />
                )}
                <span className="drop-shadow-sm">
                  {pwaInstall.isIOSInstallCapable ? t("pwa.gotIt", "Got it") : t("pwa.installAction", "Install App")}
                </span>
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
