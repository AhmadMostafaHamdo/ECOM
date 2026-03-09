const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authenticate = require("../middleware/authenticate");
const requireAdmin = require("../middleware/admin");

router.get("/admin/stats", authenticate, requireAdmin, adminController.getStats);

// Contact messages
router.get("/admin/contact/messages", authenticate, requireAdmin, adminController.getContactMessages);
router.put("/admin/contact/messages/:id", authenticate, requireAdmin, adminController.updateContactMessage);
router.delete("/admin/contact/messages/:id", authenticate, requireAdmin, adminController.deleteContactMessage);

// Review management
router.get("/admin/reviews", authenticate, requireAdmin, adminController.getAllReviews);

module.exports = router;
