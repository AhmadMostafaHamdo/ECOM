const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authenticate = require("../middleware/authenticate");

// Public routes
router.get("/comments/:productId", commentController.getComments);

// Private routes
router.post("/comments", authenticate, commentController.submitComment);
router.post("/comments/:id/like", authenticate, commentController.likeComment);
router.delete("/comments/:id", authenticate, commentController.deleteComment);

module.exports = router;
