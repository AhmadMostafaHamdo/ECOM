const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authenticate = require("../middleware/authenticate");
const requireAdmin = require("../middleware/admin");
const upload = require("../middleware/upload");

const categoryUpload = upload.any();

router.get("/getcategories", categoryController.getCategories);
router.get("/categories", categoryController.getDashboardCategories);
router.get("/categories/:id", categoryController.getCategoryById);

// Admin only operations
router.post("/categories", authenticate, requireAdmin, categoryUpload, categoryController.createCategory);
router.put("/categories/:id", authenticate, requireAdmin, categoryUpload, categoryController.updateCategory);
router.delete("/categories/:id", authenticate, requireAdmin, categoryController.deleteCategory);

module.exports = router;
