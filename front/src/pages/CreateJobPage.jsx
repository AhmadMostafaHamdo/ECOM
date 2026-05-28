import React, { useCallback, useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Logincontext } from "../Components/context/Contextprovider";
import JobForm from "../Components/dashboard/jobs/JobForm";
import { fetchJobCategories, createJob } from "../services/jobService";
import { toast } from "react-toastify";

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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-12">
      {/* Using max-w-4xl here instead of 7xl. 
        Forms are more readable when they don't stretch too wide. 
      */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Section */}
        <header className="mb-8">
          <p className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-1">
            {t("jobs.postJob", "Post a Job")}
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("jobs.createJobTitle", "Publish a Job Opportunity")}
          </h1>
          <p className="text-gray-500 mt-2">
            {t("jobs.createJobSubtitle", "Fill in the job details and publish your opportunity to the marketplace.")}
          </p>
        </header>

        {/* Form Container */}
        <main className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
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
        </main>
        
      </div>
    </div>
  );
};

export default CreateJobPage;