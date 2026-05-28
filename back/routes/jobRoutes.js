const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const authenticate = require("../middleware/authenticate");
const requireAdmin = require("../middleware/admin");

router.get("/jobs", authenticate.optional, jobController.getJobs);
router.get("/jobs/:id", authenticate.optional, jobController.getJobById);
router.post("/jobs", authenticate, jobController.createJob);
router.patch("/jobs/:id", authenticate, jobController.updateJob);
router.patch("/jobs/:id/status", authenticate, jobController.updateJobStatus);
router.delete("/jobs/:id", authenticate, jobController.deleteJob);

router.get("/admin/jobs", authenticate, requireAdmin, jobController.getJobs);
router.post("/admin/jobs", authenticate, requireAdmin, jobController.createJob);
router.patch("/admin/jobs/:id", authenticate, requireAdmin, jobController.updateJob);
router.delete("/admin/jobs/:id", authenticate, requireAdmin, jobController.deleteJob);

module.exports = router;
