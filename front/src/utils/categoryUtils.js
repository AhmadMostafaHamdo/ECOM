import { ROOT_URL } from "../api";

export const CATEGORY_ALL_VALUE = "All Categories";
export const PLACEHOLDER_IMAGE = "/logo192.png";

export const isDefaultUncategorizedCategory = (category) => {
  const name =
    typeof category?.name === "string"
      ? category.name
      : category?.name?.en || category?.name?.ar || "";

  return (
    name.trim().toLowerCase() === "uncategorized" ||
    category?.slug?.trim?.().toLowerCase() === "uncategorized"
  );
};

export const getActiveLanguage = (i18n) =>
  (i18n?.language || "en").toLowerCase().startsWith("ar") ? "ar" : "en";

export const getLocalizedName = (name, language = "en") => {
  if (!name) return "";

  let parsed = name;
  if (typeof name === "string") {
    if (name.trim().startsWith("{") && name.trim().endsWith("}")) {
      try {
        parsed = JSON.parse(name);
      } catch (e) {
        return name;
      }
    } else {
      return name;
    }
  }

  if (typeof parsed === "object" && parsed !== null) {
    if (parsed[language]) return parsed[language];
    return parsed.en || parsed.ar || Object.values(parsed)[0] || "";
  }

  return String(name);
};

export const getCategoryValue = (category) => {
  if (typeof category === "string") return category;
  return getLocalizedName(category?.name, "en") || category?.value || category?.label || "";
};

export const getSubCategoryValue = (subCategory) => {
  if (typeof subCategory === "string") return subCategory;
  return (
    subCategory?.value ||
    subCategory?.slug ||
    getLocalizedName(subCategory?.name, "en") ||
    ""
  );
};

export const resolveImageUrl = (image) => {
  if (!image) return "";
  if (image.startsWith("http") || image.startsWith("blob:")) return image;
  if (image.startsWith("/")) return `${ROOT_URL}${image}`;
  return `${ROOT_URL}/${image}`;
};

export const normalizeCategoryOption = (category, t, language = "en") => {
  if (typeof category === "string") {
    return {
      name: category,
      value: category,
      label: category === CATEGORY_ALL_VALUE ? t("navigation.allCategories") : category,
      image: "",
      subCategories: [],
    };
  }

  const value = getCategoryValue(category);
  const isAll = category?._id === "all" || value === CATEGORY_ALL_VALUE;
  return {
    ...category,
    value,
    label: isAll
      ? t("navigation.allCategories")
      : getLocalizedName(category?.name, language) || value,
    image: category?.image || "",
    subCategories: Array.isArray(category?.subCategories)
      ? category.subCategories
        .filter((sub) => sub?.active !== false)
        .map((sub) => ({
          ...sub,
          value: getSubCategoryValue(sub),
          label: getLocalizedName(sub?.name, language) || getSubCategoryValue(sub),
          image: sub?.image || "",
        }))
      : [],
  };
};
