const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authenticate = require("../middleware/authenticate");
const requireAdmin = require("../middleware/admin");

router.get("/getcategories", categoryController.getCategories);
router.get("/categories", categoryController.getDashboardCategories);

// Admin only operations
router.post("/categories", authenticate, requireAdmin, categoryController.createCategory);
router.put("/categories/:id", authenticate, requireAdmin, categoryController.updateCategory);
router.delete("/categories/:id", authenticate, requireAdmin, categoryController.deleteCategory);

module.exports = router;
