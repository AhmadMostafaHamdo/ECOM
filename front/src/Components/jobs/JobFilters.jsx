import React from "react";
import { useTranslation } from "react-i18next";
import { JOB_TYPES } from "../../utils/jobStatus";
import { getLocalizedName, getActiveLanguage, isDefaultUncategorizedCategory } from "../../utils/categoryUtils";
import { RotateCcw } from "lucide-react";

const JobFilters = ({
  filters,
  categories = [],
  onFiltersChange,
  onReset,
}) => {
  const { t, i18n } = useTranslation();
  const language = getActiveLanguage(i18n);

  const visibleCategories = categories.filter(
    (category) => !isDefaultUncategorizedCategory(category)
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    onFiltersChange(name, value);
  };

  return (
    <section className="job-filters">
      <div className="job-filters__header">
        <h2>{t("jobs.filters", "Filters")}</h2>
        <button type="button" onClick={onReset} className="job-filters__reset">
          <RotateCcw size={14} />
          {t("jobs.reset", "Reset")}
        </button>
      </div>

      <div className="job-filters__field-row">
        <div className="job-filters__field">
          <label htmlFor="job-search">{t("jobs.search", "Keyword")}</label>
          <input
            type="text"
            id="job-search"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder={t("jobs.searchPlaceholder", "Search jobs, company, or skill")}
          />
        </div>

        <div className="job-filters__field">
          <label htmlFor="job-category">{t("jobs.category", "Category")}</label>
          <select
            id="job-category"
            name="category"
            value={filters.category}
            onChange={handleChange}
          >
            <option value="">{t("jobs.allCategories", "All categories")}</option>
            {visibleCategories.map((category) => (
              <option key={category._id || category.slug || category.value} value={category._id || category.slug || category.value}>
                {getLocalizedName({ en: category.name_en, ar: category.name_ar }, language) || category.slug}
              </option>
            ))}
          </select>
        </div>

        <div className="job-filters__field">
          <label htmlFor="job-type">{t("jobs.jobType", "Job type")}</label>
          <select
            id="job-type"
            name="job_type"
            value={filters.job_type}
            onChange={handleChange}
          >
            <option value="">{t("jobs.anyType", "Any type")}</option>
            {JOB_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {language === "ar" ? type.labelAr : type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="job-filters__field">
          <label htmlFor="job-location">{t("jobs.location", "Location / City")}</label>
          <input
            type="text"
            id="job-location"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder={t("jobs.locationPlaceholder", "Enter city or location")}
          />
        </div>

        <div className="job-filters__field">
          <label htmlFor="job-sort">{t("jobs.sortBy", "Sort by")}</label>
          <select
            id="job-sort"
            name="sort"
            value={filters.sort}
            onChange={handleChange}
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
