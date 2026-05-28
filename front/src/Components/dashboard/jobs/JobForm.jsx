import React from "react";
import { DollarSign, MapPin, Mail, Phone, Briefcase, Edit3 } from "lucide-react";
import "../products/product-form.css";

const Field = ({ label, hint, icon: Icon, full = false, children }) => (
  <div className={`pf-field${full ? " pf-field--full" : ""}`}>
    <div className="pf-field__label-row">
      <label className="pf-field__label">{label}</label>
      {hint && <span className="pf-field__hint">{hint}</span>}
    </div>
    <div className="pf-field__control">
      {Icon && (
        <span className="pf-field__icon" aria-hidden="true">
          <Icon size={15} />
        </span>
      )}
      {children}
    </div>
  </div>
);

const JobForm = ({ isEditing, form, categories = [], updateField, handleSubmit, resetForm, saving, t, error }) => {
  return (
    <form className="pf-root" onSubmit={handleSubmit} noValidate>
      <fieldset className="pf-section">
        <legend className="pf-section__legend">
          <Briefcase size={13} />
          {t("admin.jobIdentity", "Job Details")}
        </legend>
        <div className="pf-grid pf-grid--2">
          <Field label={t("jobs.title", "Title")} icon={Edit3}>
            <input id="job-title" type="text" name="title" value={form.title} onChange={updateField} required className="pf-input" />
          </Field>

          <Field label={t("jobs.company", "Company")} icon={Briefcase}>
            <input id="job-company" type="text" name="company_name" value={form.company_name} onChange={updateField} required className="pf-input" />
          </Field>

          <Field label={t("jobs.location", "Location")} icon={MapPin}>
            <input id="job-location" type="text" name="location" value={form.location} onChange={updateField} className="pf-input" />
          </Field>

          <Field label={t("jobs.type", "Job Type")} icon={Briefcase}>
            <select id="job-type" name="job_type" value={form.job_type} onChange={updateField} className="pf-input pf-select">
              <option value="">{t("jobs.selectType", "Select type…")}</option>
              <option value="full_time">{t("jobs.types.full_time", "Full time")}</option>
              <option value="part_time">{t("jobs.types.part_time", "Part time")}</option>
              <option value="contract">{t("jobs.types.contract", "Contract")}</option>
              <option value="internship">{t("jobs.types.internship", "Internship")}</option>
            </select>
          </Field>

          <Field label={t("jobs.salaryRange", "Salary range")} icon={DollarSign} full>
            <div style={{ display: "flex", gap: "8px" }}>
              <input id="salary-min" type="number" name="salary_min" value={form.salary_min} onChange={updateField} className="pf-input" placeholder={t("jobs.min", "Min")} />
              <input id="salary-max" type="number" name="salary_max" value={form.salary_max} onChange={updateField} className="pf-input" placeholder={t("jobs.max", "Max")} />
              <select name="currency" value={form.currency} onChange={updateField} className="pf-input pf-select" style={{ width: "120px" }}>
                <option value="USD">USD</option>
                <option value="SYP">SYP</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </Field>

          <Field label={t("jobs.category", "Category")} icon={Briefcase}>
            <select id="job-category" name="category" value={form.category} onChange={updateField} className="pf-input pf-select">
              <option value="">{t("jobs.selectCategory", "Select category…")}</option>
              {categories.map((c) => (
                <option key={c._id || c.value || c.slug} value={c._id || c.value || c.slug}>
                  {c.name_en || c.name || c.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="pf-section">
        <legend className="pf-section__legend">
          <Edit3 size={13} />
          {t("admin.jobDescription", "Description")}
        </legend>
        <Field label={t("jobs.description", "Description")} icon={Edit3} full>
          <textarea id="job-description" name="description" value={form.description} onChange={updateField} rows={4} className="pf-input pf-textarea" />
        </Field>

        <Field label={t("jobs.requirements", "Requirements")} icon={Edit3} full>
          <textarea id="job-requirements" name="requirements" value={form.requirements} onChange={updateField} rows={4} className="pf-input pf-textarea" />
        </Field>

        <Field label={t("jobs.responsibilities", "Responsibilities")} icon={Edit3} full>
          <textarea id="job-responsibilities" name="responsibilities" value={form.responsibilities} onChange={updateField} rows={4} className="pf-input pf-textarea" />
        </Field>

        <Field label={t("jobs.contactEmail", "Contact Email")} icon={Mail}>
          <input id="contact-email" type="email" name="contact_email" value={form.contact_email} onChange={updateField} className="pf-input" />
        </Field>

        <Field label={t("jobs.contactPhone", "Contact Phone")} icon={Phone}>
          <input id="contact-phone" type="text" name="contact_phone" value={form.contact_phone} onChange={updateField} className="pf-input" />
        </Field>

        <Field label={t("jobs.status", "Status")} icon={Edit3}>
          <select id="job-status" name="status" value={form.status} onChange={updateField} className="pf-input pf-select">
            <option value="draft">{t("jobs.status.draft", "Draft")}</option>
            <option value="published">{t("jobs.status.published", "Published")}</option>
            <option value="closed">{t("jobs.status.closed", "Closed")}</option>
          </select>
        </Field>
      </fieldset>

      {error ? <div className="pf-error" role="alert">{error}</div> : null}

      <div className="pf-actions">
        <button type="button" className="pf-btn pf-btn--ghost" onClick={resetForm} disabled={saving}>{t("dialog.cancel", "Cancel")}</button>
        <button type="submit" className="pf-btn pf-btn--primary" disabled={saving}>{saving ? <span className="pf-btn__spinner" aria-hidden="true" /> : null}<span>{saving ? t("common.loading", "Saving…") : isEditing ? t("common.save", "Save Changes") : t("admin.createJob", "Create Job")}</span></button>
      </div>
    </form>
  );
};

export default JobForm;
