import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchJobById } from "../services/jobService";
import Button from "../Components/common/Button";
import JobStatusBadge from "../components/jobs/JobStatusBadge";
import { getLocalizedName, getActiveLanguage } from "../utils/categoryUtils";
import "../components/jobs/jobs.css";
import { toast } from "react-toastify";

const JobDetailsPage = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const language = getActiveLanguage(i18n);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      try {
        const response = await fetchJobById(id);
        setJob(response);
      } catch (error) {
        console.error(error);
        toast.error(t("jobs.detailLoadError", "Failed to load job details"));
      } finally {
        setLoading(false);
      }
    };
    if (id) loadJob();
  }, [id, t]);

  const categoryLabel = getLocalizedName(
    job?.category?.name || { en: job?.category?.name_en, ar: job?.category?.name_ar },
    language,
  );

  const postedAt = job?.createdAt
    ? new Date(job.createdAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="job-details_page">
      <div className="job-details_header">
        <Button variant="ghost" onClick={() => navigate(-1)}>{t("jobs.backToJobs", "Back to jobs")}</Button>
      </div>

      {loading ? (
        <div className="job-details_loading">{t("jobs.loadingDetails", "Loading job details...")}</div>
      ) : !job ? (
        <div className="job-details_empty">
          <h2>{t("jobs.notFoundTitle", "Job not found")}</h2>
          <p>{t("jobs.notFoundMessage", "This job may no longer be available.")}</p>
        </div>
      ) : (
        <article className="job-details_card">
          <div className="job-details_top">
            <div>
              <p className="jobs_page_tag">{t("jobs.jobDetails", "Job Details")}</p>
              <h1>{job.title}</h1>
              <p className="job-details_company">{job.company_name}</p>
            </div>
            <JobStatusBadge status={job.status} />
          </div>

          <div className="job-details_meta">
            <div>
              <span>{t("jobs.location", "Location")}</span>
              <strong>{job.location || t("jobs.notSpecified", "Not specified")}</strong>
            </div>
            <div>
              <span>{t("jobs.category", "Category")}</span>
              <strong>{categoryLabel || t("jobs.notSpecified", "Not specified")}</strong>
            </div>
            <div>
              <span>{t("jobs.jobType", "Job type")}</span>
              <strong>{job.job_type?.replace(/_/g, " ") || t("jobs.notSpecified", "Not specified")}</strong>
            </div>
            <div>
              <span>{t("jobs.postedAt", "Posted")}</span>
              <strong>{postedAt}</strong>
            </div>
          </div>

          <section className="job-details_section">
            <h2>{t("jobs.description", "Description")}</h2>
            <p>{job.description || t("jobs.noDescription", "No description provided.")}</p>
          </section>

          {job.requirements && (
            <section className="job-details_section">
              <h2>{t("jobs.requirements", "Requirements")}</h2>
              <p>{job.requirements}</p>
            </section>
          )}

          {job.responsibilities && (
            <section className="job-details_section">
              <h2>{t("jobs.responsibilities", "Responsibilities")}</h2>
              <p>{job.responsibilities}</p>
            </section>
          )}

          <section className="job-details_section job-details_contact">
            <h2>{t("jobs.contactInformation", "Contact Information")}</h2>
            {job.contact_email && <p>{t("jobs.email", "Email")}: {job.contact_email}</p>}
            {job.contact_phone && <p>{t("jobs.phone", "Phone")}: {job.contact_phone}</p>}
          </section>
        </article>
      )}
    </div>
  );
};

export default JobDetailsPage;
