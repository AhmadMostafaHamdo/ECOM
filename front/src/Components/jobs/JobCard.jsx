import React from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, MapPin, Clock3, Building2 } from "lucide-react";
import Card from "../common/Card";
import JobStatusBadge from "./JobStatusBadge";
import { getLocalizedName, getActiveLanguage } from "../../utils/categoryUtils";

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
  const language = getActiveLanguage({ language: navigator.language });
  const postedAt = job.createdAt ? new Date(job.createdAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  const categoryLabel = getLocalizedName(
    job.category?.name || { en: job.category?.name_en, ar: job.category?.name_ar },
    language,
  );

  return (
    <Card className="job-card" hoverable clickable onClick={() => navigate(`/jobs/${job._id}`)}>
      <div className="job-card__header">
        <div>
          <h3 className="job-card__title">{job.title}</h3>
          <p className="job-card__company">{job.company_name}</p>
        </div>
        <JobStatusBadge status={job.status} />
      </div>

      <div className="job-card__meta">
        <span className="job-card__meta-item">
          <Briefcase size={16} /> {job.job_type?.replace(/_/g, " ")}
        </span>
        <span className="job-card__meta-item">
          <MapPin size={16} /> {job.location || "—"}
        </span>
        <span className="job-card__meta-item">
          <Building2 size={16} /> {categoryLabel || "—"}
        </span>
      </div>

      <div className="job-card__details">
        <p>{job.description?.slice(0, 150)}{job.description?.length > 150 ? "…" : ""}</p>
      </div>

      <div className="job-card__footer">
        <span className="job-card__salary">{formatSalary(job)}</span>
        <span className="job-card__date">
          <Clock3 size={14} /> {postedAt}
        </span>
      </div>
    </Card>
  );
};

export default JobCard;
