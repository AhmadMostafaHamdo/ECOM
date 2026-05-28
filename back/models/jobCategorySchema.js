const mongoose = require("mongoose");

const jobCategorySchema = new mongoose.Schema({
  name_en: {
    type: String,
    required: true,
    trim: true,
  },
  name_ar: {
    type: String,
    trim: true,
    default: "",
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
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

jobCategorySchema.pre("validate", function () {
  if (!this.slug && this.name_en) {
    this.slug = normalizeSlug(this.name_en);
  }
  if (this.slug) {
    this.slug = normalizeSlug(this.slug);
  }
});

const JobCategory = mongoose.model("JobCategory", jobCategorySchema);
module.exports = JobCategory;
