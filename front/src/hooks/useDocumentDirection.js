import { useEffect } from "react";

export const useDocumentDirection = (i18n) => {
  useEffect(() => {
    const language = i18n.resolvedLanguage || i18n.language || "en";
    const direction = language.startsWith("ar") ? "rtl" : "ltr";

    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    document.body.dir = direction;
  }, [i18n, i18n.language, i18n.resolvedLanguage]);
};
