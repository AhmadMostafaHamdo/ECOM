import React from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, MapPin, Clock3, Building2, ChevronRight, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import JobStatusBadge from "./JobStatusBadge";
import { getLocalizedName, getActiveLanguage } from "../../utils/categoryUtils";
import { getJobTypeLabel } from "../../utils/jobStatus";

const formatSalary = (job, t) => {
  const min = job.salary_min != null ? job.salary_min : "";
  const max = job.salary_max != null ? job.salary_max : "";
  const currency = job.currency || "USD";

  if (min && max) return `${currency} ${min} - ${max}`;
  if (min) return `${currency} ${min}`;
  if (max) return `${currency} ${max}`;
  return t("jobs.salaryNotSpecified", "Salary not specified");
};

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const language = getActiveLanguage(i18n);
  const postedAt = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

  const categoryLabel = getLocalizedName(
    job.category?.name || { en: job.category?.name_en, ar: job.category?.name_ar },
    language,
  );

  const isRTL = language === "ar";
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <article
      className="job-card"
      onClick={() => navigate(`/jobs/${job._id}`)}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="job-card__header">
        <div>
          <h3 className="job-card__title" title={job.title}>{job.title}</h3>
          <p className="job-card__company">
            {job.company_name || t("jobs.companyNotSpecified", "Company not specified")}
          </p>
        </div>
        <JobStatusBadge status={job.status} />
      </div>

      <div className="job-card__meta">
        <span className="job-card__meta-item">
          <Briefcase size={14} />
          {getJobTypeLabel(job.job_type, language)}
        </span>
        <span className="job-card__meta-item">
          <MapPin size={14} />
          {job.location || t("jobs.locationNotSpecified", "Location not specified")}
        </span>
        <span className="job-card__meta-item">
          <Building2 size={14} />
          {categoryLabel || t("jobs.categoryNotSpecified", "Category not specified")}
        </span>
      </div>

      <div className="job-card__details">
        <p>{job.description || t("jobs.noDescription", "No description provided.")}</p>
      </div>

      <div className="job-card__footer">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <span className="job-card__salary">{formatSalary(job, t)}</span>
          {postedAt && (
            <span className="job-card__date">
              <Clock3 size={13} />
              {postedAt}
            </span>
          )}
        </div>

        <span className="job-card__cta">
          {t("jobs.viewDetails", "View Details")}
          <ChevronIcon size={15} />
        </span>
      </div>
    </article>
  );
};

export default JobCard;
