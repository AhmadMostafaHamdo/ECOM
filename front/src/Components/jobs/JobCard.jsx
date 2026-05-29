import React from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, MapPin, Clock3, Building2, ChevronRight, ChevronLeft } from "lucide-react";
import JobStatusBadge from "./JobStatusBadge";
import { getLocalizedName, getActiveLanguage } from "../../utils/categoryUtils";
import { getJobTypeLabel } from "../../utils/jobStatus";
import { useTranslation } from "react-i18next";

const formatSalary = (job) => {
  const min = job.salary_min != null ? job.salary_min : "";
  const max = job.salary_max != null ? job.salary_max : "";
  const currency = job.currency || "USD";

  if (min && max) return `${currency} ${min} - ${max}`;
  if (min) return `${currency} ${min}`;
  if (max) return `${currency} ${max}`;
  return "Salary not specified";
};

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const language = getActiveLanguage(i18n);
  const postedAt = job.createdAt ? new Date(job.createdAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  const categoryLabel = getLocalizedName(
    job.category?.name || { en: job.category?.name_en, ar: job.category?.name_ar },
    language,
  );

  const isRTL = language === "ar";
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div 
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer p-5 lg:p-6 group flex flex-col gap-4"
      onClick={() => navigate(`/jobs/${job._id}`)}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-1.5 flex-1">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors line-clamp-1" title={job.title}>
            {job.title}
          </h3>
          <p className="text-sm font-medium text-gray-600">
            {job.company_name || "Company not specified"}
          </p>
        </div>
        <div className="shrink-0 flex items-center">
          <JobStatusBadge status={job.status} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500">
        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
          <Briefcase size={15} className="text-gray-400" />
          <span className="font-medium">{getJobTypeLabel(job.job_type, language)}</span>
        </div>
        
        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
          <MapPin size={15} className="text-gray-400" />
          <span className="font-medium">{job.location || "Location not specified"}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
          <Building2 size={15} className="text-gray-400" />
          <span className="font-medium">{categoryLabel || "Category not specified"}</span>
        </div>
      </div>

      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
        {job.description || "No description provided."}
      </p>

      <div className="pt-4 mt-auto border-t border-gray-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-gray-900 bg-green-50 text-green-700 px-2.5 py-1 rounded-md">
            {formatSalary(job)}
          </span>
          {postedAt && (
            <span className="text-xs text-gray-500 flex items-center gap-1.5">
              <Clock3 size={14} className="text-gray-400" /> 
              {postedAt}
            </span>
          )}
        </div>
        
        <div className="flex items-center text-orange-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity gap-1">
          <span>{isRTL ? "عرض التفاصيل" : "View Details"}</span>
          <ChevronIcon size={16} />
        </div>
      </div>
    </div>
  );
};

export default JobCard;
