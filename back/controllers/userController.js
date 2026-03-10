const User = require("../models/userSchema");
const products = require("../models/productsSchema");
const { asyncHandler } = require("../middleware/errorMiddleware");

/**
 * Get user wishlist
 */
exports.getWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userID).populate("wishlist");
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user.wishlist || []);
});

/**
 * Add or remove from wishlist
 */
exports.toggleWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;

    // Check if product exists
    const product = await products.findById(productId);
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }

    const user = await User.findById(req.userID);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // Initialize wishlist if it doesn't exist
    if (!user.wishlist) user.wishlist = [];

    const index = user.wishlist.indexOf(productId);
    let saved = false;

    if (index > -1) {
        // Remove from wishlist
        user.wishlist.splice(index, 1);
        saved = false;
    } else {
        // Add to wishlist
        user.wishlist.push(productId);
        saved = true;
    }

    await user.save();
    res.status(200).json({
        saved,
        wishlistCount: user.wishlist.length,
        message: saved ? "Added to wishlist" : "Removed from wishlist"
    });
});

/**
 * Clear the entire wishlist
 */
exports.clearWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userID);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    user.wishlist = [];
    await user.save();
    res.status(200).json({ message: "Wishlist cleared", wishlist: [] });
});

/**
 * Admin: Get all users
 */
exports.getUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, role, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (role) query.role = role;
    if (search) {
        const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        query.$or = [{ fname: searchRegex }, { email: searchRegex }];
    }

    const [users, totalItems] = await Promise.all([
        User.find(query).select("-password -tokens -cpassword").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        User.countDocuments(query),
    ]);

    res.status(200).json({
        data: users,
        pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / limitNum),
            currentPage: pageNum,
            limit: limitNum,
        },
    });
});

/**
 * Admin: Get user by ID
 */
exports.getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password -tokens -cpassword");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
});

/**
 * Admin: Update user
 */
exports.updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const updates = req.body;
    delete updates.password; // Don't allow password update through this route
    delete updates.tokens;

    Object.assign(user, updates);
    await user.save();

    res.status(200).json({ success: true, data: user });
});

/**
 * Admin: Delete user
 */
exports.deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ success: true, deletedUserId: user._id });
});

/**
 * Admin: Ban user
 */
exports.banUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isBanned, banReason } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isBanned = isBanned;
    user.banReason = isBanned ? banReason : "";
    user.bannedAt = isBanned ? new Date() : null;

    await user.save();
    res.status(200).json({ success: true, data: user });
});
