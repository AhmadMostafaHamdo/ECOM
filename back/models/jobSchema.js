const mongoose = require("mongoose");
const { JOB_STATUSES, JOB_TYPES } = require("../utils/jobStatus");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobCategory",
    required: true,
  },
  company_name: {
    type: String,
    trim: true,
    default: "",
  },
  location: {
    type: String,
    trim: true,
    default: "",
  },
  job_type: {
    type: String,
    enum: JOB_TYPES,
    default: "full_time",
  },
  salary_min: {
    type: Number,
    default: 0,
    min: 0,
  },
  salary_max: {
    type: Number,
    default: 0,
    min: 0,
  },
  currency: {
    type: String,
    trim: true,
    default: "USD",
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  requirements: {
    type: String,
    trim: true,
    default: "",
  },
  responsibilities: {
    type: String,
    trim: true,
    default: "",
  },
  contact_email: {
    type: String,
    trim: true,
    default: "",
  },
  contact_phone: {
    type: String,
    trim: true,
    default: "",
  },
  status: {
    type: String,
    enum: JOB_STATUSES,
    default: "draft",
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "USER",
    required: true,
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "USER",
  },
  deleted_at: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

const normalizeSlug = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s\/\\]+/g, "-")
    .replace(/[^a-z0-9\-]+/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-+|\-+$/g, "");

jobSchema.pre("validate", function () {
  if (!this.slug && this.title) {
    this.slug = normalizeSlug(this.title);
  }
  if (this.slug) {
    this.slug = normalizeSlug(this.slug);
  }
});

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
