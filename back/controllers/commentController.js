const Comment = require("../models/commentSchema");
const { asyncHandler } = require("../middleware/errorMiddleware");

/**
 * @desc    Submit a comment
 * @route   POST /api/comments
 */
exports.submitComment = asyncHandler(async (req, res) => {
    const { productId, text, parentId } = req.body;
    const userId = req.userID;

    if (!productId || !text) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const comment = new Comment({
        productId,
        userId,
        text,
        parentId: parentId || null
    });

    await comment.save();

    const populated = await Comment.findById(comment._id).populate("userId", "fname email");
    res.status(201).json({ success: true, data: populated });
});

/**
 * @desc    Get comments for a product
 * @route   GET /api/comments/:productId
 */
exports.getComments = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ productId })
        .populate("userId", "fname email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Comment.countDocuments({ productId });

    res.status(200).json({
        data: comments,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        }
    });
});

/**
 * @desc    Like/Unlike a comment
 * @route   POST /api/comments/:id/like
 */
exports.likeComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userID;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const index = comment.likedBy.indexOf(userId);
    if (index === -1) {
        comment.likedBy.push(userId);
        comment.likeCount += 1;
    } else {
        comment.likedBy.splice(index, 1);
        comment.likeCount -= 1;
    }

    await comment.save();
    res.status(200).json({ success: true, likeCount: comment.likeCount, isLiked: index === -1 });
});

/**
 * @desc    Delete a comment
 * @route   DELETE /api/comments/:id
 */
exports.deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userID;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const canDelete = req.rootUser.role === "admin" || comment.userId.toString() === userId.toString();
    if (!canDelete) return res.status(403).json({ error: "Not allowed to delete this comment" });

    await Comment.deleteOne({ _id: id });
    // Also delete replies if any
    await Comment.deleteMany({ parentId: id });

    res.status(200).json({ success: true, message: "Comment deleted" });
});
