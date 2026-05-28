const mongoose = require("mongoose");
const jobCategoryService = require("../services/jobCategoryService");
const { asyncHandler } = require("../middleware/errorMiddleware");
const { validateJobCategoryPayload } = require("../validators/jobCategoryValidator");

exports.getJobCategories = asyncHandler(async (req, res) => {
  const categories = await jobCategoryService.getCategories();
  res.status(200).json(categories);
});

exports.getAdminJobCategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const payload = await jobCategoryService.getAdminCategories({ page, limit, search });
  res.status(200).json(payload);
});

exports.getJobCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid job category ID" });
  }

  const category = await jobCategoryService.getCategoryById(id);
  if (!category) {
    return res.status(404).json({ error: "Job category not found" });
  }

  res.status(200).json(category);
});

exports.createJobCategory = asyncHandler(async (req, res) => {
  const payload = validateJobCategoryPayload(req.body);
  if (!payload.isValid) {
    return res.status(422).json({ error: payload.error });
  }

  const category = await jobCategoryService.createCategory(payload.data);
  res.status(201).json(category);
});

exports.updateJobCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid job category ID" });
  }

  const payload = validateJobCategoryPayload(req.body, true);
  if (!payload.isValid) {
    return res.status(422).json({ error: payload.error });
  }

  const category = await jobCategoryService.updateCategory({ id, ...payload.data });
  if (!category) {
    return res.status(404).json({ error: "Job category not found" });
  }

  res.status(200).json(category);
});

exports.deleteJobCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid job category ID" });
  }

  const result = await jobCategoryService.deleteCategory(id);
  if (!result) {
    return res.status(404).json({ error: "Job category not found" });
  }
  if (result.blocked) {
    return res.status(409).json({ error: "Cannot delete category with active jobs" });
  }

  res.status(200).json({ success: true, deletedCategoryId: result._id });
});
