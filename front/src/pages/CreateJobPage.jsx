import React, { useCallback, useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Logincontext } from "../Components/context/Contextprovider";
import JobForm from "../Components/dashboard/jobs/JobForm";
import { fetchJobCategories, createJob } from "../services/jobService";
import { toast } from "react-toastify";
import "../components/jobs/jobs.css";

const initialForm = {
  title: "",
  category: "",
  company_name: "",
  location: "",
  job_type: "full_time",
  salary_min: "",
  salary_max: "",
  currency: "USD",
  description: "",
  requirements: "",
  responsibilities: "",
  contact_email: "",
  contact_phone: "",
  status: "published",
};

const CreateJobPage = () => {
  const { account } = useContext(Logincontext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await fetchJobCategories();
        setCategories(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error(error);
        toast.error(t("jobs.categoryLoadError", "Unable to load job categories"));
      }
    };
    loadCategories();
  }, [t]);

  const updateField = useCallback((event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await createJob({
        ...form,
        salary_min: Number(form.salary_min || 0),
        salary_max: Number(form.salary_max || 0),
      });
      toast.success(t("jobs.jobCreatedSuccess", "Job opportunity created successfully."));
      navigate("/jobs");
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.error || t("jobs.jobCreateError", "Failed to create job listing.");
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (!account) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="jobs_page_container">
      <div className="jobs_page_header">
        <div>
          <p className="jobs_page_tag">{t("jobs.postJob", "Post a Job")}</p>
          <h1>{t("jobs.createJobTitle", "Publish a Job Opportunity")}</h1>
          <p className="jobs_page_subtitle">{t("jobs.createJobSubtitle", "Fill in the job details and publish your opportunity to the marketplace.")}</p>
        </div>
      </div>

      <div className="jobs_page_form">
        <JobForm
          isEditing={false}
          form={form}
          categories={categories}
          updateField={updateField}
          handleSubmit={handleSubmit}
          resetForm={() => setForm(initialForm)}
          saving={saving}
          t={t}
        />
      </div>
    </div>
  );
};

export default CreateJobPage;
