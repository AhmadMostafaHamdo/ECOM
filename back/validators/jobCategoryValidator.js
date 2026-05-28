const cleanText = (value = "") => value.toString().trim();
const slugIsValid = (value = "") => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

exports.validateJobCategoryPayload = (body = {}, partial = false) => {
  const data = {
    name_en: cleanText(body.name_en || body.nameEn || body.name?.en || ""),
    name_ar: cleanText(body.name_ar || body.nameAr || body.name?.ar || ""),
    slug: cleanText(body.slug || body.slug || ""),
    status: cleanText(body.status || "active"),
  };

  if (!partial || data.name_en !== "") {
    if (!data.name_en) {
      return { isValid: false, error: "English name is required" };
    }
  }

  if (data.slug && !slugIsValid(data.slug)) {
    return { isValid: false, error: "Slug may only contain lowercase letters, numbers and hyphens" };
  }

  if (data.status && !["active", "inactive"].includes(data.status)) {
    return { isValid: false, error: "Invalid category status" };
  }

  return { isValid: true, data };
};
