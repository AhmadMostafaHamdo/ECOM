import React from "react";
import { useTranslation } from "react-i18next";
import { JOB_STATUS_META } from "../../utils/jobStatus";

const JobStatusBadge = ({ status = "draft" }) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language?.toLowerCase().startsWith("ar") ? "ar" : "en";
  const meta = JOB_STATUS_META[status] || { label: status, labelAr: status, className: "draft" };
  const label = language === "ar" ? meta.labelAr || meta.label : meta.label;

  return <span className={`job-status-badge job-status-badge--${meta.className}`}>{t(`jobs.status.${status}`, label)}</span>;
};

export default JobStatusBadge;
