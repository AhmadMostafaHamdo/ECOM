import React, { createContext, useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const LocalizeContext = createContext();

export const COUNTRIES = [
  { id: "sa", name: "المملكة العربية السعودية", currency: "SAR", locale: "ar-SA", code: "+966" },
  { id: "ae", name: "الإمارات العربية المتحدة", currency: "AED", locale: "ar-AE", code: "+971" },
  { id: "eg", name: "جمهورية مصر العربية", currency: "EGP", locale: "ar-EG", code: "+20" },
  { id: "us", name: "United States", currency: "USD", locale: "en-US", code: "+1" },
  { id: "gb", name: "United Kingdom", currency: "GBP", locale: "en-GB", code: "+44" }
];

export const LocalizeProvider = ({ children }) => {
  const { i18n } = useTranslation();
  
  // Try to load saved country from localStorage, default to KSA
  const [activeCountry, setActiveCountry] = useState(() => {
    const saved = localStorage.getItem("activeCountry");
    if (saved) {
      const parsedUserRegion = JSON.parse(saved);
      return COUNTRIES.find(c => c.id === parsedUserRegion.id) || COUNTRIES[0];
    }
    return COUNTRIES[0];
  });

  useEffect(() => {
    localStorage.setItem("activeCountry", JSON.stringify(activeCountry));
    // Optionally change the i18n language here based on locale if needed, 
    // e.g., activeCountry.locale.startsWith('ar') ? i18n.changeLanguage('ar') : i18n.changeLanguage('en')
    document.documentElement.lang = activeCountry.locale.split("-")[0];
  }, [activeCountry, i18n]);

  const changeCountry = (countryId) => {
    const newCountry = COUNTRIES.find((c) => c.id === countryId);
    if (newCountry) {
      setActiveCountry(newCountry);
    }
  };

  return (
    <LocalizeContext.Provider value={{ activeCountry, changeCountry, COUNTRIES }}>
      {children}
    </LocalizeContext.Provider>
  );
};

export const useLocalize = () => useContext(LocalizeContext);
export default LocalizeProvider;
