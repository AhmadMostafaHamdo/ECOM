import React from "react";
import { useTranslation } from "react-i18next";
import { JOB_STATUS_META } from "../../utils/jobStatus";

const statusStyles = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  published: "bg-green-100 text-green-700 border-green-200",
  closed: "bg-red-100 text-red-700 border-red-200",
  archived: "bg-orange-100 text-orange-700 border-orange-200",
};

const JobStatusBadge = ({ status = "draft" }) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language?.toLowerCase().startsWith("ar") ? "ar" : "en";
  const meta = JOB_STATUS_META[status] || { label: status, labelAr: status, className: "draft" };
  const label = language === "ar" ? meta.labelAr || meta.label : meta.label;
  
  const tailwindClasses = statusStyles[meta.className] || statusStyles.draft;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tailwindClasses}`}>
      {t(`jobs.status.${status}`, label)}
    </span>
  );
};

export default JobStatusBadge;
