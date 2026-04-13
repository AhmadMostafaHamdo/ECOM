const Review = require("../models/reviewSchema");
const products = require("../models/productsSchema");
const User = require("../models/userSchema");
const { asyncHandler } = require("../middleware/errorMiddleware");

/**
 * @desc    Submit a review
 * @route   POST /api/reviews
 */
exports.submitReview = asyncHandler(async (req, res) => {
    const { targetType, targetId, rating, title, comment, verifiedPurchase } = req.body;
    const reviewerId = req.userID;

    if (!targetType || !targetId || !rating) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ targetType, targetId, reviewerId });
    if (existingReview) {
        return res.status(409).json({ error: "You have already reviewed this item" });
    }

    const review = new Review({
        targetType,
        targetId,
        reviewerId,
        rating,
        title,
        comment,
        verifiedPurchase: verifiedPurchase || false
    });

    await review.save();

    // Update product rating if target is product
    if (targetType === "product") {
        const allReviews = await Review.find({ targetType: "product", targetId, status: "approved" });
        const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
        await products.updateOne({ id: targetId }, { $set: { rating: avgRating, reviewsCount: allReviews.length } });
    }

    res.status(201).json({ success: true, data: review });
});

/**
 * @desc    Get reviews for a target
 * @route   GET /api/reviews/:targetType/:targetId
 */
exports.getReviews = asyncHandler(async (req, res) => {
    const { targetType, targetId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ targetType, targetId, status: "approved" })
        .populate("reviewerId", "fname email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Review.countDocuments({ targetType, targetId, status: "approved" });

    res.status(200).json({
        data: reviews,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        }
    });
});

/**
 * @desc    Vote review as helpful/unhelpful
 * @route   PUT /api/reviews/:id/helpful
 */
exports.voteHelpful = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { type } = req.body; // 'helpful' or 'unhelpful'
    const userId = req.userID;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    if (type === "helpful") {
        const index = review.helpfulVoters.indexOf(userId);
        if (index === -1) {
            review.helpfulVoters.push(userId);
            review.helpful += 1;
            // Remove from unhelpful if present
            const unIndex = review.unhelpfulVoters.indexOf(userId);
            if (unIndex !== -1) {
                review.unhelpfulVoters.splice(unIndex, 1);
                review.unhelpful -= 1;
            }
        } else {
            review.helpfulVoters.splice(index, 1);
            review.helpful -= 1;
        }
    } else if (type === "unhelpful") {
        const index = review.unhelpfulVoters.indexOf(userId);
        if (index === -1) {
            review.unhelpfulVoters.push(userId);
            review.unhelpful += 1;
            // Remove from helpful if present
            const helpIndex = review.helpfulVoters.indexOf(userId);
            if (helpIndex !== -1) {
                review.helpfulVoters.splice(helpIndex, 1);
                review.helpful -= 1;
            }
        } else {
            review.unhelpfulVoters.splice(index, 1);
            review.unhelpful -= 1;
        }
    }

    await review.save();
    res.status(200).json({ success: true, helpful: review.helpful, unhelpful: review.unhelpful });
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 */
exports.deleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userID;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    const canDelete = req.rootUser.role === "admin" || review.reviewerId.toString() === userId.toString();
    if (!canDelete) return res.status(403).json({ error: "Not allowed to delete this review" });

    await Review.deleteOne({ _id: id });

    // Update product rating if target is product
    if (review.targetType === "product") {
        const allReviews = await Review.find({ targetType: "product", targetId: review.targetId, status: "approved" });
        const avgRating = allReviews.length > 0 ? allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length : 0;
        await products.updateOne({ id: review.targetId }, { $set: { rating: avgRating, reviewsCount: allReviews.length } });
    }

    res.status(200).json({ success: true, message: "Review deleted" });
});
