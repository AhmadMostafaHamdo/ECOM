import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Share2, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";

const PWAFloatingInstall = ({ pwaInstall }) => {
  const { t } = useTranslation();
  const [direction, setDirection] = useState("rtl");
  const [showIOSHint, setShowIOSHint] = useState(false);

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
    if (!pwaInstall.shouldShowFloatingInstall) {
      setShowIOSHint(false);
    }
  }, [pwaInstall.shouldShowFloatingInstall]);

  const handleInstall = async () => {
    const choice = await pwaInstall.installApp();

    if (choice?.outcome === "manual") {
      setShowIOSHint(true);
    }
  };

  return (
    <AnimatePresence>
      {pwaInstall.shouldShowFloatingInstall && (
        <motion.div
          className="fixed bottom-4 z-[1000] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 sm:bottom-6"
          dir={direction}
          style={{ insetInlineEnd: "1rem" }}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.96 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <AnimatePresence>
            {showIOSHint && pwaInstall.isIOSInstallCapable && (
              <motion.div
                className="max-w-[280px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-raised)] p-4 text-sm leading-6 text-[var(--text-2)] shadow-[var(--shadow-floating)]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                <div className="flex items-start gap-3">
                  <Share2 className="mt-1 shrink-0 text-[var(--primary)]" size={18} aria-hidden="true" />
                  <p>{t("pwa.iosInstructions", "On iPhone: Press Share → Add to Home Screen")}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={handleInstall}
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border-2 border-[var(--surface-1)] bg-[var(--primary)] px-6 text-sm font-extrabold text-white shadow-2xl transition hover:-translate-y-1 hover:bg-[var(--primary-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
            title={t("pwa.installAction", "Install app")}
            aria-label={`${t("pwa.installAction", "Install App")} ${t("pwa.appTitle", "Studio Commerce")}`}
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20">
              {pwaInstall.isIOSInstallCapable ? (
                <Smartphone size={18} aria-hidden="true" />
              ) : (
                <Download size={18} aria-hidden="true" />
              )}
            </span>
            <span className="drop-shadow-sm px-2">{t("pwa.installAction", "Install App")}</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAFloatingInstall;
