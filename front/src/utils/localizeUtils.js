// utils/localizeUtils.js

/**
 * Format currency based on active user's locale and currency code.
 * Example: KSA -> ١٥٠٫٠٠ ر.س. , US -> $150.00
 */
export const formatCurrency = (amount, locale = "ar-SA", currencyCode = "SAR") => {
  if (amount == null) return "-";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.warn("Currency format failed", error);
    return `${amount} ${currencyCode}`;
  }
};

/**
 * Format a Date object dynamically based on the local standard (MM/DD/YYYY for US, DD/MM/YYYY for KSA)
 */
export const formatDate = (dateString, locale = "ar-SA") => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    console.warn("Date format failed", error);
    return date.toLocaleDateString();
  }
};

/**
 * Ensures phone number matches country format.
 */
export const getLocalPhonePlaceholder = (countryIso) => {
  const formats = {
    'sa': '+966 5X XXX XXXX',
    'ae': '+971 5X XXX XXXX',
    'eg': '+20 1X XXXX XXXX',
    'us': '+1 (XXX) XXX-XXXX',
    'gb': '+44 7XXX XXXXXX',
  };
  return formats[countryIso] || '+XXX XXXX XXXX';
};
