const express = require("express");
const router = express.Router();
const { cacheMiddleware } = require("../middleware/cacheMiddleware");
const adminController = require("../controllers/adminController");
const authenticate = require("../middleware/authenticate");
const requireAdmin = require("../middleware/admin");

router.get("/admin/stats", authenticate, requireAdmin, cacheMiddleware(3600), adminController.getStats); // Cache for 1 hour

// Contact messages
router.get("/admin/contact/messages", authenticate, requireAdmin, cacheMiddleware(300), adminController.getContactMessages);
router.put("/admin/contact/messages/:id", authenticate, requireAdmin, adminController.updateContactMessage);
router.delete("/admin/contact/messages/:id", authenticate, requireAdmin, adminController.deleteContactMessage);

// Review management
router.get("/admin/reviews", authenticate, requireAdmin, cacheMiddleware(600), adminController.getAllReviews);

module.exports = router;
