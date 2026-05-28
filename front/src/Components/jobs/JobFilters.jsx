import React from "react";
import { useTranslation } from "react-i18next";
import Input from "../common/Input";
import Button from "../common/Button";
import { JOB_TYPES } from "../../services/jobService";
import { getLocalizedName, getActiveLanguage } from "../../utils/categoryUtils";

const JobFilters = ({
  filters,
  categories = [],
  onFiltersChange,
  onReset,
}) => {
  const { t, i18n } = useTranslation();
  const language = getActiveLanguage(i18n);

  const handleChange = (event) => {
    const { name, value } = event.target;
    onFiltersChange(name, value);
  };

  return (
    <section className="job-filters">
      <div className="job-filters__header">
        <h2>{t("jobs.filters", "Filters")}</h2>
        <Button variant="ghost" size="sm" onClick={onReset}>{t("jobs.reset", "Reset")}</Button>
      </div>

      <Input
        label={t("jobs.search", "Keyword")}
        name="search"
        id="job-search"
        value={filters.search}
        onChange={handleChange}
        placeholder={t("jobs.searchPlaceholder", "Search jobs, company, or skill")}
      />

      <div className="job-filters__field-row">
        <Input
          label={t("jobs.category", "Category")}
          id="job-category"
          name="category"
          as="select"
          value={filters.category}
          onChange={handleChange}
        >
          <option value="">{t("jobs.allCategories", "All categories")}</option>
          {categories.map((category) => (
            <option key={category._id || category.slug || category.value} value={category._id || category.slug || category.value}>
              {getLocalizedName({ en: category.name_en, ar: category.name_ar }, language) || category.slug}
            </option>
          ))}
        </Input>

        <Input
          label={t("jobs.jobType", "Job type")}
          id="job-type"
          name="job_type"
          as="select"
          value={filters.job_type}
          onChange={handleChange}
        >
          <option value="">{t("jobs.anyType", "Any type")}</option>
          {JOB_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {language === "ar" ? type.labelAr : type.label}
            </option>
          ))}
        </Input>
      </div>

      <Input
        label={t("jobs.location", "Location / City")}
        id="job-location"
        name="location"
        value={filters.location}
        onChange={handleChange}
        placeholder={t("jobs.locationPlaceholder", "Enter city or location")}
      />

      <Input
        label={t("jobs.sortBy", "Sort by")}
        id="job-sort"
        name="sort"
        as="select"
        value={filters.sort}
        onChange={handleChange}
      >
        <option value="newest">{t("jobs.sort.newest", "Newest")}</option>
        <option value="oldest">{t("jobs.sort.oldest", "Oldest")}</option>
      </Input>
    </section>
  );
};

export default JobFilters;
