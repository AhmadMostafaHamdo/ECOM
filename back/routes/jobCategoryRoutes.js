const express = require("express");
const router = express.Router();
const jobCategoryController = require("../controllers/jobCategoryController");
const authenticate = require("../middleware/authenticate");
const requireAdmin = require("../middleware/admin");

router.get("/job-categories", jobCategoryController.getJobCategories);
router.get("/admin/job-categories", authenticate, requireAdmin, jobCategoryController.getAdminJobCategories);
router.get("/job-categories/:id", jobCategoryController.getJobCategoryById);
router.post("/admin/job-categories", authenticate, requireAdmin, jobCategoryController.createJobCategory);
router.patch("/admin/job-categories/:id", authenticate, requireAdmin, jobCategoryController.updateJobCategory);
router.delete("/admin/job-categories/:id", authenticate, requireAdmin, jobCategoryController.deleteJobCategory);

module.exports = router;
