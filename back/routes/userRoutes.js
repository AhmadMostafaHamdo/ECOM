const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticate = require("../middleware/authenticate");
const requireAdmin = require("../middleware/admin");

// All admin operations
router.get("/admin/users", authenticate, requireAdmin, userController.getUsers);
router.get("/admin/users/:id", authenticate, requireAdmin, userController.getUserById);
router.post("/admin/users", authenticate, requireAdmin, userController.createUser);
router.put("/admin/users/:id", authenticate, requireAdmin, userController.updateUser);
router.delete("/admin/users/:id", authenticate, requireAdmin, userController.deleteUser);
router.post("/admin/users/:id/ban", authenticate, requireAdmin, userController.banUser);

module.exports = router;
