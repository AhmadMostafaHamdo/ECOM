import { useCallback, useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../services/http";

const CATEGORY_ALL = "All Categories";

export const useStorefrontFilters = (t) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ALL);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const refreshCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/getcategories");
      const payload = response.data;
      const categoriesArray = payload.data || payload;

      if (!Array.isArray(categoriesArray)) {
        setCategories([]);
        return;
      }

      // Normalizing categories from API
      const normalized = categoriesArray.map((category) => {
        if (typeof category === "string") {
          return {
            name: category,
            label: category === CATEGORY_ALL ? t("navigation.allCategories") : category,
          };
        }
        return {
          ...category,
          label: category.name === CATEGORY_ALL ? t("navigation.allCategories") : (category.label || category.name),
        };
      });

      setCategories(normalized);
    } catch (error) {
      console.error("Category list refresh failed:", error.message);
    }
  }, [t]);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      const categoryNames = categories.map((category) => category.name);
      if (!categoryNames.includes(selectedCategory)) {
        setSelectedCategory(CATEGORY_ALL);
      }
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    if (searchTerm.trim()) {
      setSelectedCategory(CATEGORY_ALL);
      setAppliedFilters(null);
    }
  }, [searchTerm]);

  const handleFilterApply = useCallback((payload) => {
    setAppliedFilters(payload);
  }, []);

  return useMemo(
    () => ({
      categories,
      selectedCategory,
      appliedFilters,
      searchTerm,
      setSelectedCategory,
      setSearchTerm,
      handleFilterApply,
      refreshCategories,
      categoryAllValue: CATEGORY_ALL,
    }),
    [
      categories,
      selectedCategory,
      appliedFilters,
      searchTerm,
      handleFilterApply,
      refreshCategories,
    ],
  );
};
