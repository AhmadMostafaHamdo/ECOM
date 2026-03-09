export const arabicCountryNames = {
  sy: "سوريا",
  lb: "لبنان",
  jo: "الأردن",
  eg: "مصر",
  sa: "السعودية",
  ae: "الإمارات",
  om: "عمان",
  kw: "الكويت",
  qa: "قطر",
  bh: "البحرين",
  iq: "العراق",
  ps: "فلسطين",
  tr: "تركيا",
  us: "الولايات المتحدة",
  gb: "المملكة المتحدة",
  de: "ألمانيا",
  fr: "فرنسا",
};

export function getTranslatedCountryName(iso2, defaultName, language) {
  if (language === "ar") {
    return arabicCountryNames[iso2.toLowerCase()] || defaultName;
  }
  return defaultName;
}

export function getSearchableCountryNames(iso2, defaultName) {
  const arabic = arabicCountryNames[iso2.toLowerCase()];
  if (arabic) {
    return [defaultName, arabic];
  }
  return [defaultName];
}
