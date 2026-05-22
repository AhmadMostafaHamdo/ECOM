import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEYS = {
  installed: "studio-commerce-pwa-installed",
  promptSeen: "studio-commerce-pwa-install-prompt-seen",
  dismissed: "studio-commerce-pwa-install-dismissed",
};

const isBrowser = () => typeof window !== "undefined";

const readStorage = (key) => {
  if (!isBrowser()) return false;

  try {
    return window.localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
};

const writeStorage = (key, value) => {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(key, value ? "true" : "false");
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
};

const getStandaloneState = () => {
  if (!isBrowser()) return false;

  const mediaStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches;
  const iosStandalone = window.navigator.standalone === true;

  return Boolean(mediaStandalone || iosStandalone);
};

const getIOSInstallCapability = () => {
  if (!isBrowser()) return false;

  const navigator = window.navigator;
  const userAgent = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const isIOSDevice =
    /iphone|ipad|ipod/i.test(userAgent) ||
    (platform === "MacIntel" && navigator.maxTouchPoints > 1);

  return isIOSDevice && !getStandaloneState();
};

export const usePWAInstall = () => {
  const deferredPromptRef = useRef(null);
  const [canPromptInstall, setCanPromptInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    return getStandaloneState() || readStorage(STORAGE_KEYS.installed);
  });
  const [hasSeenPrompt, setHasSeenPrompt] = useState(() =>
    readStorage(STORAGE_KEYS.promptSeen),
  );
  const [wasDismissed, setWasDismissed] = useState(() =>
    readStorage(STORAGE_KEYS.dismissed),
  );
  const [isIOSInstallCapable, setIsIOSInstallCapable] = useState(() =>
    getIOSInstallCapability(),
  );

  useEffect(() => {
    if (!isBrowser()) return undefined;

    const refreshInstallState = () => {
      const standalone = getStandaloneState();

      setIsInstalled(standalone || readStorage(STORAGE_KEYS.installed));
      setIsIOSInstallCapable(getIOSInstallCapability());
    };

    const handleBeforeInstallPrompt = (event) => {
      if (getStandaloneState() || readStorage(STORAGE_KEYS.installed)) return;

      event.preventDefault();
      deferredPromptRef.current = event;
      setCanPromptInstall(true);
    };

    const handleInstalled = () => {
      deferredPromptRef.current = null;
      writeStorage(STORAGE_KEYS.installed, true);
      writeStorage(STORAGE_KEYS.dismissed, false);
      writeStorage(STORAGE_KEYS.promptSeen, true);
      setCanPromptInstall(false);
      setIsInstalled(true);
      setWasDismissed(false);
      setHasSeenPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    const displayModeQuery = window.matchMedia?.("(display-mode: standalone)");
    displayModeQuery?.addEventListener?.("change", refreshInstallState);

    refreshInstallState();

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      displayModeQuery?.removeEventListener?.("change", refreshInstallState);
    };
  }, []);

  const markPromptSeen = useCallback(() => {
    writeStorage(STORAGE_KEYS.promptSeen, true);
    setHasSeenPrompt(true);
  }, []);

  const dismissPrompt = useCallback(() => {
    markPromptSeen();
    writeStorage(STORAGE_KEYS.dismissed, true);
    setWasDismissed(true);
  }, [markPromptSeen]);

  const installApp = useCallback(async () => {
    markPromptSeen();

    if (isIOSInstallCapable && !deferredPromptRef.current) {
      writeStorage(STORAGE_KEYS.dismissed, true);
      setWasDismissed(true);
      return { outcome: "manual" };
    }

    const prompt = deferredPromptRef.current;

    if (!prompt) {
      writeStorage(STORAGE_KEYS.dismissed, true);
      setWasDismissed(true);
      return { outcome: "unavailable" };
    }

    deferredPromptRef.current = null;
    setCanPromptInstall(false);

    await prompt.prompt();
    const choice = await prompt.userChoice;

    if (choice?.outcome === "accepted") {
      writeStorage(STORAGE_KEYS.installed, true);
      writeStorage(STORAGE_KEYS.dismissed, false);
      setIsInstalled(true);
      setWasDismissed(false);
    } else {
      writeStorage(STORAGE_KEYS.dismissed, true);
      setWasDismissed(true);
    }

    return choice;
  }, [isIOSInstallCapable, markPromptSeen]);

  const isInstallAvailable = useMemo(() => {
    return !isInstalled && (canPromptInstall || isIOSInstallCapable);
  }, [canPromptInstall, isIOSInstallCapable, isInstalled]);

  return {
    canPromptInstall,
    dismissPrompt,
    hasSeenPrompt,
    installApp,
    isIOSInstallCapable,
    isInstallAvailable,
    isInstalled,
    shouldShowFloatingInstall: isInstallAvailable && wasDismissed,
    wasDismissed,
  };
};

export default usePWAInstall;
