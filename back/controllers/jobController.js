const mongoose = require("mongoose");
const jobService = require("../services/jobService");
const jobCategoryService = require("../services/jobCategoryService");
const { asyncHandler } = require("../middleware/errorMiddleware");
const { validateJobPayload } = require("../validators/jobValidator");

const isOwnerOrAdmin = (job, userId, isAdmin) => {
  if (!job) return false;
  if (isAdmin) return true;
  return job.created_by?.toString() === userId?.toString();
};

exports.getJobs = asyncHandler(async (req, res) => {
  const isAdmin = req.rootUser?.role === "admin";
  const payload = await jobService.getJobsList({
    search: req.query.search || "",
    category: req.query.category || "",
    status: req.query.status || "",
    location: req.query.location || "",
    job_type: req.query.job_type || "",
    sort: req.query.sort || "newest",
    page: req.query.page || 1,
    limit: req.query.limit || 10,
    userId: req.userID,
    isAdmin,
    mine: req.query.mine === "true",
  });
  res.status(200).json(payload);
});

exports.getJobById = asyncHandler(async (req, res) => {
  const isAdmin = req.rootUser?.role === "admin";
  const job = await jobService.getJobById({ id: req.params.id, userId: req.userID, isAdmin });
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  res.status(200).json(job);
});

exports.createJob = asyncHandler(async (req, res) => {
  const payload = validateJobPayload(req.body);
  if (!payload.isValid) {
    return res.status(422).json({ error: payload.error });
  }

  const category = await jobCategoryService.getCategoryById(payload.data.category);
  if (!category) {
    return res.status(404).json({ error: "Job category not found" });
  }

  const job = await jobService.createJob({ payload: payload.data, userId: req.userID });
  res.status(201).json(job);
});

exports.updateJob = asyncHandler(async (req, res) => {
  const payload = validateJobPayload(req.body, true);
  if (!payload.isValid) {
    return res.status(422).json({ error: payload.error });
  }

  const existing = await jobService.getJobById({ id: req.params.id, userId: req.userID, isAdmin: req.rootUser?.role === "admin" });
  if (!existing) {
    return res.status(404).json({ error: "Job not found" });
  }
  if (!isOwnerOrAdmin(existing, req.userID, req.rootUser?.role === "admin")) {
    return res.status(403).json({ error: "Not authorized to edit this job" });
  }

  if (payload.data.category) {
    const category = await jobCategoryService.getCategoryById(payload.data.category);
    if (!category) {
      return res.status(404).json({ error: "Job category not found" });
    }
  }

  const updatedJob = await jobService.updateJob({ id: req.params.id, payload: payload.data, userId: req.userID });
  res.status(200).json(updatedJob);
});

exports.updateJobStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const job = await jobService.getJobById({ id: req.params.id, userId: req.userID, isAdmin: req.rootUser?.role === "admin" });
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  if (!isOwnerOrAdmin(job, req.userID, req.rootUser?.role === "admin")) {
    return res.status(403).json({ error: "Not authorized to change job status" });
  }

  const updated = await jobService.updateJobStatus({ id: req.params.id, status, userId: req.userID });
  if (!updated) {
    return res.status(400).json({ error: "Invalid status or update failed" });
  }

  res.status(200).json(updated);
});

exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await jobService.getJobById({ id: req.params.id, userId: req.userID, isAdmin: req.rootUser?.role === "admin" });
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  if (!isOwnerOrAdmin(job, req.userID, req.rootUser?.role === "admin")) {
    return res.status(403).json({ error: "Not authorized to delete this job" });
  }

  const deleted = await jobService.softDeleteJob({ id: req.params.id, userId: req.userID });
  if (!deleted) {
    return res.status(400).json({ error: "Failed to delete job" });
  }

  res.status(200).json({ success: true, deletedJobId: deleted._id });
});
