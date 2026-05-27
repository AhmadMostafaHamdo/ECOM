export const getLocalizedName = (value, lang = 'en') => {
  if (!value) return "";

  let parsed = value;
  // If it's a string that looks like JSON, try to parse it
  if (typeof value === "string") {
    if (value.startsWith("{") && value.endsWith("}")) {
      try {
        parsed = JSON.parse(value);
      } catch (e) {
        return value; // if parsing fails, return the string as is
      }
    } else {
      return value; // plain string
    }
  }

  // Now parsed should be an object
  if (typeof parsed === "object" && parsed !== null) {
    if (parsed[lang]) {
      return parsed[lang];
    }
    // Fallback to English, then Arabic, then whatever first key exists
    return parsed.en || parsed.ar || Object.values(parsed)[0] || "";
  }

  return String(value);
};
