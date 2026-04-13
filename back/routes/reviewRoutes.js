const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const authenticate = require("../middleware/authenticate");

// Public routes
router.get("/reviews/:targetType/:targetId", reviewController.getReviews);

// Private routes
router.post("/reviews", authenticate, reviewController.submitReview);
router.put("/reviews/:id/helpful", authenticate, reviewController.voteHelpful);
router.delete("/reviews/:id", authenticate, reviewController.deleteReview);

module.exports = router;
