import React from "react";
import { useTranslation } from "react-i18next";
import "./LanguageSwitcher.css";

const LanguageSwitcher = ({ variant = "glass" }) => {
  const { t, i18n } = useTranslation();
  const activeLanguage = i18n.resolvedLanguage || i18n.language || "en";

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem("i18nextLng", language);
  };

  return (
    <div className={`language_switcher language_switcher--${variant}`}>
      <button
        type="button"
        className={`lang_btn ${activeLanguage === "en" ? "active" : ""}`}
        onClick={() => changeLanguage("en")}
        title={t("language.english", "English")}
      >
        <span className="lang_text">EN</span>
      </button>
      <button
        type="button"
        className={`lang_btn ${activeLanguage === "ar" ? "active" : ""}`}
        onClick={() => changeLanguage("ar")}
        title={t("language.arabic", "Arabic")}
      >
        <span className="lang_text">AR</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
