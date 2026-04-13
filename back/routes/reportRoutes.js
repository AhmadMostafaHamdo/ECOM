const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const authenticate = require("../middleware/authenticate");
const requireAdmin = require("../middleware/admin");

// User routes
router.post("/reports", authenticate, reportController.submitReport);

// Admin routes
router.get("/admin/reports", authenticate, requireAdmin, reportController.getReports);
router.get("/admin/reports/stats", authenticate, requireAdmin, reportController.getReportStats);
router.delete("/admin/reports/:id", authenticate, requireAdmin, reportController.deleteReport);

module.exports = router;
