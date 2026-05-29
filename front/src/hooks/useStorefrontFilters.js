import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { axiosInstance } from "../services/http";
import { getActiveLanguage, normalizeCategoryOption } from "../utils/categoryUtils";

// Sentinel: empty string = "All Categories" / no filter
const CATEGORY_ALL = "";

export const useStorefrontFilters = (t, i18n) => {
  const [categories, setCategories] = useState([]);
  // Store IDs, not names/values — prevents false resets after language change
  const [selectedCategoryId, setSelectedCategoryId] = useState(CATEGORY_ALL);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(CATEGORY_ALL);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const language = getActiveLanguage(i18n);

  // Track previous language so we only re-fetch on actual language change,
  // not re-render, and do NOT reset selection when categories reload.
  const prevLanguageRef = useRef(language);

  const refreshCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/getcategories");
      const payload = response.data;
      const categoriesArray = payload.data || payload;

      if (!Array.isArray(categoriesArray)) {
        setCategories([]);
        return;
      }

      const normalized = categoriesArray.map((category) =>
        normalizeCategoryOption(category, t, language)
      );

      setCategories(normalized);
      // ✅ No selection reset here — let the user's choice persist
    } catch (error) {
      console.error("Category list refresh failed:", error.message);
    }
  }, [t, language]);

  // Initial load
  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  // When language actually changes, re-fetch labels but keep selected IDs
  useEffect(() => {
    if (prevLanguageRef.current !== language) {
      prevLanguageRef.current = language;
      refreshCategories();
    }
  }, [language, refreshCategories]);

  // ✅ REMOVED: the effect that reset selectedCategory when categories reloaded
  // ✅ REMOVED: the effect that reset selectedCategory when searchTerm changed

  const handleCategoryChange = useCallback((categoryId) => {
    const newId = categoryId ?? CATEGORY_ALL;
    setSelectedCategoryId(newId);
    // Only reset sub-category when the category actually changes
    setSelectedSubCategoryId(CATEGORY_ALL);
    setAppliedFilters(null);
  }, []);

  const handleSubCategoryChange = useCallback((subCategoryId) => {
    setSelectedSubCategoryId(subCategoryId ?? CATEGORY_ALL);
    setAppliedFilters(null);
  }, []);

  const handleFilterApply = useCallback((payload) => {
    setAppliedFilters(payload);
  }, []);

  // Derive the human-readable "selectedCategory" value that Maincomp uses
  // for its product fetch payload (it sends the category name string to the API).
  // Maincomp still uses `selectedCategory` as a string name — preserve that API.
  const selectedCategoryValue = useMemo(() => {
    if (!selectedCategoryId) return CATEGORY_ALL;
    const found = categories.find(
      (cat) => cat._id === selectedCategoryId || cat.value === selectedCategoryId
    );
    return found ? found.value : CATEGORY_ALL;
  }, [categories, selectedCategoryId]);

  const selectedSubCategoryValue = useMemo(() => {
    if (!selectedSubCategoryId) return "";
    // Walk all subCategories across all categories
    for (const cat of categories) {
      const sub = (cat.subCategories || []).find(
        (s) => s._id === selectedSubCategoryId || s.value === selectedSubCategoryId
      );
      if (sub) return sub.value;
    }
    return "";
  }, [categories, selectedSubCategoryId]);

  return useMemo(
    () => ({
      categories,
      // Expose ID-based state for Newnav (uses _id for matching)
      selectedCategoryId,
      selectedSubCategoryId,
      // Expose value-based state for Maincomp (sends name string to API)
      selectedCategory: selectedCategoryValue,
      selectedSubCategory: selectedSubCategoryValue,
      appliedFilters,
      searchTerm,
      setSelectedCategory: handleCategoryChange,
      setSelectedSubCategory: handleSubCategoryChange,
      setSearchTerm,
      handleFilterApply,
      refreshCategories,
      categoryAllValue: CATEGORY_ALL,
    }),
    [
      categories,
      selectedCategoryId,
      selectedSubCategoryId,
      selectedCategoryValue,
      selectedSubCategoryValue,
      appliedFilters,
      searchTerm,
      handleCategoryChange,
      handleSubCategoryChange,
      handleFilterApply,
      refreshCategories,
    ]
  );
};
