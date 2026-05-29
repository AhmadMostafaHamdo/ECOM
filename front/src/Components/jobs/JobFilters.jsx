import React from "react";
import { useTranslation } from "react-i18next";
import { JOB_TYPES } from "../../utils/jobStatus";
import { getLocalizedName, getActiveLanguage } from "../../utils/categoryUtils";
import { RotateCcw } from "lucide-react";

const JobFilters = ({
  filters,
  categories = [],
  onFiltersChange,
  onReset,
}) => {
  const { t, i18n } = useTranslation();
  const language = getActiveLanguage(i18n);
  const { isDefaultUncategorizedCategory } = require("../../utils/categoryUtils");
  
  const visibleCategories = categories.filter(
    (category) => !isDefaultUncategorizedCategory(category)
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    onFiltersChange(name, value);
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">{t("jobs.filters", "Filters")}</h2>
        <button 
          onClick={onReset}
          className="text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw size={14} />
          {t("jobs.reset", "Reset")}
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="job-search" className="text-sm font-medium text-gray-700">{t("jobs.search", "Keyword")}</label>
          <input
            type="text"
            id="job-search"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder={t("jobs.searchPlaceholder", "Search jobs, company, or skill")}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="job-category" className="text-sm font-medium text-gray-700">{t("jobs.category", "Category")}</label>
            <select
              id="job-category"
              name="category"
              value={filters.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white"
            >
              <option value="">{t("jobs.allCategories", "All categories")}</option>
              {visibleCategories.map((category) => (
                <option key={category._id || category.slug || category.value} value={category._id || category.slug || category.value}>
                  {getLocalizedName({ en: category.name_en, ar: category.name_ar }, language) || category.slug}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="job-type" className="text-sm font-medium text-gray-700">{t("jobs.jobType", "Job type")}</label>
            <select
              id="job-type"
              name="job_type"
              value={filters.job_type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white"
            >
              <option value="">{t("jobs.anyType", "Any type")}</option>
              {JOB_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {language === "ar" ? type.labelAr : type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="job-location" className="text-sm font-medium text-gray-700">{t("jobs.location", "Location / City")}</label>
          <input
            type="text"
            id="job-location"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder={t("jobs.locationPlaceholder", "Enter city or location")}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="job-sort" className="text-sm font-medium text-gray-700">{t("jobs.sortBy", "Sort by")}</label>
          <select
            id="job-sort"
            name="sort"
            value={filters.sort}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white"
          >
            <option value="newest">{t("jobs.sort.newest", "Newest")}</option>
            <option value="oldest">{t("jobs.sort.oldest", "Oldest")}</option>
          </select>
        </div>
      </div>
    </section>
  );
};

export default JobFilters;
