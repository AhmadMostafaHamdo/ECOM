const { JOB_STATUSES, JOB_TYPES } = require("../utils/jobStatus");

const emailIsValid = (value) => {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const phoneIsValid = (value) => {
  if (!value) return true;
  return /^[0-9+\-()\s]{6,20}$/.test(value);
};

const cleanText = (value = "") => value.toString().trim();

exports.validateJobPayload = (body = {}, partial = false) => {
  const data = {
    title: body.title !== undefined ? cleanText(body.title) : undefined,
    category: body.category !== undefined ? body.category : undefined,
    company_name: body.company_name !== undefined ? cleanText(body.company_name) : undefined,
    location: body.location !== undefined ? cleanText(body.location) : undefined,
    job_type: body.job_type !== undefined ? cleanText(body.job_type) : undefined,
    salary_min: body.salary_min === undefined ? undefined : Number(body.salary_min),
    salary_max: body.salary_max === undefined ? undefined : Number(body.salary_max),
    currency: body.currency !== undefined ? cleanText(body.currency) : undefined,
    description: body.description !== undefined ? cleanText(body.description) : undefined,
    requirements: body.requirements !== undefined ? cleanText(body.requirements) : undefined,
    responsibilities: body.responsibilities !== undefined ? cleanText(body.responsibilities) : undefined,
    contact_email: body.contact_email !== undefined ? cleanText(body.contact_email) : undefined,
    contact_phone: body.contact_phone !== undefined ? cleanText(body.contact_phone) : undefined,
    status: body.status !== undefined ? cleanText(body.status) : undefined,
  };

  if (!partial || data.title !== undefined) {
    if (!data.title) return { isValid: false, error: "Job title is required" };
  }
  if (!partial || data.category !== undefined) {
    if (!data.category) return { isValid: false, error: "Job category is required" };
  }
  if (!partial || data.description !== undefined) {
    if (!data.description) return { isValid: false, error: "Job description is required" };
  }
  if (!partial || data.status !== undefined) {
    if (!data.status) return { isValid: false, error: "Job status is required" };
  }

  if (data.salary_min !== undefined && Number.isNaN(data.salary_min)) {
    return { isValid: false, error: "Minimum salary must be a number" };
  }
  if (data.salary_max !== undefined && Number.isNaN(data.salary_max)) {
    return { isValid: false, error: "Maximum salary must be a number" };
  }
  if (data.salary_min !== undefined && data.salary_max !== undefined) {
    if (data.salary_max < data.salary_min) {
      return { isValid: false, error: "Maximum salary must be greater than or equal to minimum salary" };
    }
  }

  if (data.contact_email && !emailIsValid(data.contact_email)) {
    return { isValid: false, error: "Invalid email address" };
  }

  if (data.contact_phone && !phoneIsValid(data.contact_phone)) {
    return { isValid: false, error: "Invalid phone number" };
  }

  if (data.job_type && !JOB_TYPES.includes(data.job_type)) {
    return { isValid: false, error: "Invalid job type" };
  }
  if (data.status && !JOB_STATUSES.includes(data.status)) {
    return { isValid: false, error: "Invalid job status" };
  }

  return { isValid: true, data };
};
