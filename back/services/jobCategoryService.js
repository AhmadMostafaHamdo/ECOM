const mongoose = require("mongoose");
const JobCategory = require("../models/jobCategorySchema");
const Job = require("../models/jobSchema");
const { escapeRegex } = require("../utils/helpers");

const normalizeSlug = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s\/\\]+/g, "-")
    .replace(/[^a-z0-9\-]+/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-+|\-+$/g, "");

const generateUniqueSlug = async (slugCandidate, currentId = null) => {
  const baseSlug = normalizeSlug(slugCandidate) || `${Date.now()}`;
  let slug = baseSlug;
  let count = 0;

  while (true) {
    const query = { slug };
    if (currentId) {
      query._id = { $ne: currentId };
    }

    const existing = await JobCategory.findOne(query).lean();
    if (!existing) break;

    count += 1;
    slug = `${baseSlug}-${count}`;
  }

  return slug;
};

exports.buildCategoryQuery = (search) => {
  if (!search) return {};
  const searchRegex = new RegExp(escapeRegex(search), "i");
  return {
    $or: [
      { name_en: searchRegex },
      { name_ar: searchRegex },
      { slug: searchRegex },
    ],
  };
};

exports.getCategories = async () =>
  JobCategory.find({ status: "active" }).sort({ name_en: 1 }).lean();

exports.getAdminCategories = async ({ page = 1, limit = 10, search = "" }) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;
  const query = this.buildCategoryQuery(search);

  const [categories, totalItems] = await Promise.all([
    JobCategory.find(query).sort({ name_en: 1 }).skip(skip).limit(limitNum).lean(),
    JobCategory.countDocuments(query),
  ]);

  return {
    data: categories,
    page: pageNum,
    limit: limitNum,
    total: totalItems,
    total_pages: Math.ceil(totalItems / limitNum),
  };
};

exports.getCategoryById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return JobCategory.findById(id).lean();
};

exports.createCategory = async ({ name_en, name_ar, slug, status }) => {
  const normalizedSlug = await generateUniqueSlug(slug || name_en || name_ar);
  return JobCategory.create({
    name_en: name_en?.toString().trim() || "",
    name_ar: name_ar?.toString().trim() || "",
    slug: normalizedSlug,
    status: status || "active",
  });
};

exports.updateCategory = async ({ id, name_en, name_ar, slug, status }) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const category = await JobCategory.findById(id);
  if (!category) return null;

  const nextSlug = slug
    ? await generateUniqueSlug(slug, id)
    : await generateUniqueSlug(name_en || category.name_en || category.name_ar, id);

  category.name_en = name_en?.toString().trim() || category.name_en;
  category.name_ar = name_ar?.toString().trim() || category.name_ar;
  category.slug = nextSlug;
  category.status = status || category.status;

  await category.save();
  return category;
};

exports.deleteCategory = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const category = await JobCategory.findById(id);
  if (!category) return null;

  const hasJobs = await Job.exists({ category: category._id, deleted_at: null });
  if (hasJobs) {
    return { blocked: true, category };
  }

  await JobCategory.findByIdAndDelete(id);
  return category;
};
