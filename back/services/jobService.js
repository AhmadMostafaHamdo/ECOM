const mongoose = require("mongoose");
const Job = require("../models/jobSchema");
const JobCategory = require("../models/jobCategorySchema");
const { escapeRegex } = require("../utils/helpers");
const { JOB_STATUSES, JOB_TYPES } = require("../utils/jobStatus");

const normalizeSlug = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s\/\\]+/g, "-")
    .replace(/[^a-z0-9\-]+/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-+|\-+$/g, "");

const resolveCategoryReference = async (category) => {
  if (!category) return null;
  if (mongoose.Types.ObjectId.isValid(category)) {
    return new mongoose.Types.ObjectId(category);
  }

  const found = await JobCategory.findOne({ slug: normalizeSlug(category) }).lean();
  return found?._id || null;
};

const generateUniqueSlug = async (title, currentJobId = null) => {
  const baseSlug = normalizeSlug(title) || `${Date.now()}`;
  let slug = baseSlug;
  let count = 0;

  while (true) {
    const query = { slug };
    if (currentJobId) {
      query._id = { $ne: currentJobId };
    }

    const existing = await Job.findOne(query).lean();
    if (!existing) break;

    count += 1;
    slug = `${baseSlug}-${count}`;
  }

  return slug;
};

const buildJobQuery = async ({
  search,
  category,
  status,
  location,
  job_type,
  mine,
  userId,
  isAdmin,
}) => {
  const query = { deleted_at: null };

  if (category) {
    const categoryId = await resolveCategoryReference(category);
    if (categoryId) {
      query.category = categoryId;
    }
  }

  if (status && JOB_STATUSES.includes(status)) {
    query.status = status;
  }

  if (job_type && JOB_TYPES.includes(job_type)) {
    query.job_type = job_type;
  }

  if (location) {
    const locationRegex = new RegExp(escapeRegex(location), "i");
    query.location = locationRegex;
  }

  if (!isAdmin && !mine) {
    query.status = "published";
  }

  if (mine && userId && mongoose.Types.ObjectId.isValid(userId)) {
    query.created_by = new mongoose.Types.ObjectId(userId);
  }

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), "i");
    query.$or = [
      { title: searchRegex },
      { company_name: searchRegex },
      { location: searchRegex },
      { description: searchRegex },
      { requirements: searchRegex },
      { responsibilities: searchRegex },
    ];
  }

  return query;
};

const normalizeJobPayload = (payload = {}) => ({
  title: payload.title?.toString().trim() || "",
  category: payload.category || null,
  company_name: payload.company_name?.toString().trim() || "",
  location: payload.location?.toString().trim() || "",
  job_type: JOB_TYPES.includes(payload.job_type) ? payload.job_type : "full_time",
  salary_min: Number(payload.salary_min || 0),
  salary_max: Number(payload.salary_max || 0),
  currency: payload.currency?.toString().trim() || "USD",
  description: payload.description?.toString().trim() || "",
  requirements: payload.requirements?.toString().trim() || "",
  responsibilities: payload.responsibilities?.toString().trim() || "",
  contact_email: payload.contact_email?.toString().trim() || "",
  contact_phone: payload.contact_phone?.toString().trim() || "",
  status: JOB_STATUSES.includes(payload.status) ? payload.status : "draft",
});

exports.getJobsList = async (params = {}) => {
  const pageNum = Math.max(1, parseInt(params.page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(params.limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;
  const sortDirection = params.sort === "oldest" ? 1 : -1;
  const query = await buildJobQuery(params);

  const [jobs, totalItems] = await Promise.all([
    Job.find(query)
      .populate("category", "name_en name_ar slug")
      .populate("created_by", "fname email")
      .sort({ createdAt: sortDirection })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Job.countDocuments(query),
  ]);

  return {
    data: jobs,
    page: pageNum,
    limit: limitNum,
    total: totalItems,
    total_pages: Math.ceil(totalItems / limitNum),
  };
};

exports.getJobById = async ({ id, userId, isAdmin }) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const query = { _id: id, deleted_at: null };
  if (!isAdmin) {
    query.$or = [{ status: "published" }];
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.$or.push({ created_by: new mongoose.Types.ObjectId(userId) });
    }
  }

  return Job.findOne(query)
    .populate("category", "name_en name_ar slug")
    .populate("created_by", "fname email")
    .lean();
};

exports.createJob = async ({ payload, userId }) => {
  const normalized = normalizeJobPayload(payload);
  const slug = await generateUniqueSlug(normalized.title);

  const job = await Job.create({
    ...normalized,
    slug,
    created_by: userId,
    updated_by: userId,
  });

  return Job.findById(job._id)
    .populate("category", "name_en name_ar slug")
    .populate("created_by", "fname email")
    .lean();
};

exports.updateJob = async ({ id, payload, userId }) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const job = await Job.findById(id);
  if (!job || job.deleted_at) {
    return null;
  }

  const normalized = normalizeJobPayload(payload);
  if (normalized.title && normalized.title !== job.title) {
    job.slug = await generateUniqueSlug(normalized.title, job._id);
  }

  const updates = { updated_by: userId };
  if (payload.title !== undefined) updates.title = normalized.title;
  if (payload.category !== undefined) updates.category = normalized.category;
  if (payload.company_name !== undefined) updates.company_name = normalized.company_name;
  if (payload.location !== undefined) updates.location = normalized.location;
  if (payload.job_type !== undefined) updates.job_type = normalized.job_type;
  if (payload.salary_min !== undefined) updates.salary_min = normalized.salary_min;
  if (payload.salary_max !== undefined) updates.salary_max = normalized.salary_max;
  if (payload.currency !== undefined) updates.currency = normalized.currency;
  if (payload.description !== undefined) updates.description = normalized.description;
  if (payload.requirements !== undefined) updates.requirements = normalized.requirements;
  if (payload.responsibilities !== undefined) updates.responsibilities = normalized.responsibilities;
  if (payload.contact_email !== undefined) updates.contact_email = normalized.contact_email;
  if (payload.contact_phone !== undefined) updates.contact_phone = normalized.contact_phone;
  if (payload.status !== undefined) updates.status = normalized.status;

  Object.assign(job, updates);

  await job.save();

  return Job.findById(job._id)
    .populate("category", "name_en name_ar slug")
    .populate("created_by", "fname email")
    .lean();
};

exports.updateJobStatus = async ({ id, status, userId }) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }
  if (!JOB_STATUSES.includes(status)) {
    return null;
  }

  const job = await Job.findById(id);
  if (!job || job.deleted_at) {
    return null;
  }

  job.status = status;
  job.updated_by = userId;
  if (status === "archived") {
    job.deleted_at = job.deleted_at || new Date();
  }
  await job.save();

  return Job.findById(job._id)
    .populate("category", "name_en name_ar slug")
    .populate("created_by", "fname email")
    .lean();
};

exports.softDeleteJob = async ({ id, userId }) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const job = await Job.findById(id);
  if (!job || job.deleted_at) {
    return null;
  }

  job.deleted_at = new Date();
  job.status = "archived";
  job.updated_by = userId;
  await job.save();

  return job;
};
