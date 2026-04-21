import { useCallback, useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../services/http";

const CATEGORY_ALL = "All Categories";

export const useStorefrontFilters = (t) => {
  const [categories, setCategories] = useState([
    {
      name: CATEGORY_ALL,
      label: t("navigation.allCategories"),
    },
  ]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ALL);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const refreshCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/getcategories");
      const payload = response.data;
      const categoriesArray = payload.data || payload;

      if (!Array.isArray(categoriesArray) || categoriesArray.length === 0) {
        setCategories([
          {
            name: CATEGORY_ALL,
            label: t("navigation.allCategories"),
          },
        ]);
        return;
      }

      setCategories([
        {
          name: CATEGORY_ALL,
          label: t("navigation.allCategories"),
        },
        ...categoriesArray.map((category) =>
          typeof category === "string"
            ? { name: category, label: category }
            : {
                ...category,
                label: category.label || category.name,
              },
        ),
      ]);
    } catch (error) {
      console.error("Category list refresh failed:", error.message);
    }
  }, [t]);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  useEffect(() => {
    setCategories((current) => {
      if (current.length === 0) {
        return current;
      }

      const [firstCategory, ...rest] = current;

      return [
        {
          ...firstCategory,
          name: CATEGORY_ALL,
          label: t("navigation.allCategories"),
        },
        ...rest,
      ];
    });
  }, [t]);

  useEffect(() => {
    const categoryNames = categories.map((category) => category.name);

    if (!categoryNames.includes(selectedCategory)) {
      setSelectedCategory(CATEGORY_ALL);
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
