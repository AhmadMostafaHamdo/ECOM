import { useCallback, useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../services/http";
import { CATEGORY_ALL_VALUE, getActiveLanguage, normalizeCategoryOption } from "../utils/categoryUtils";

const CATEGORY_ALL = CATEGORY_ALL_VALUE;

export const useStorefrontFilters = (t, i18n) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ALL);
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const language = getActiveLanguage(i18n);

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
        normalizeCategoryOption(category, t, language),
      );

      setCategories(normalized);
    } catch (error) {
      console.error("Category list refresh failed:", error.message);
    }
  }, [t, language]);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      const categoryNames = categories.map((category) => category.value);
      if (!categoryNames.includes(selectedCategory)) {
        setSelectedCategory(CATEGORY_ALL);
        setSelectedSubCategory("");
      }
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    if (searchTerm.trim()) {
      setSelectedCategory(CATEGORY_ALL);
      setSelectedSubCategory("");
      setAppliedFilters(null);
    }
  }, [searchTerm]);

  const handleCategoryChange = useCallback((value) => {
    setSelectedCategory(value || CATEGORY_ALL);
    setSelectedSubCategory("");
  }, []);

  const handleFilterApply = useCallback((payload) => {
    setAppliedFilters(payload);
  }, []);

  return useMemo(
    () => ({
      categories,
      selectedCategory,
      selectedSubCategory,
      appliedFilters,
      searchTerm,
      setSelectedCategory: handleCategoryChange,
      setSelectedSubCategory,
      setSearchTerm,
      handleFilterApply,
      refreshCategories,
      categoryAllValue: CATEGORY_ALL,
    }),
    [
      categories,
      selectedCategory,
      selectedSubCategory,
      appliedFilters,
      searchTerm,
      handleCategoryChange,
      handleFilterApply,
      refreshCategories,
    ],
  );
};
