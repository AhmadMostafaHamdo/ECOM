 const User = require("../models/userSchema");
const products = require("../models/productsSchema");
const mongoose = require("mongoose");
const { asyncHandler } = require("../middleware/errorMiddleware");

// Safe user projection — never return passwords or tokens
const SAFE_SELECT = "-password -tokens -cpassword";

// Sanitize user output for admin views
const toPublicUser = (user) => ({
    _id: user._id,
    fname: user.fname,
    email: user.email,
    mobile: user.mobile,
    role: user.role || "user",
    country: user.country || "",
    cartsCount: Array.isArray(user.carts) ? user.carts.length : 0,
    wishlistCount: Array.isArray(user.wishlist) ? user.wishlist.length : 0,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isBanned: user.isBanned || false,
    banReason: user.banReason || "",
    bannedAt: user.bannedAt || null,
    isVerified: user.isVerified || false,
});

/**
 * Get user wishlist
 */
exports.getWishlist = asyncHandler(async (req, res) => {
    // Populate with explicit model reference
    let user = await User.findById(req.userID).populate({
        path: "wishlist",
        model: "products"
    });

    if (!user) {
        console.error(`[WishlistTrace] User not found: ${req.userID}`);
        return res.status(404).json({ error: "User not found" });
    }

    // Identify successfully populated items
    let wishlistItems = (user.wishlist || []).filter(item => item && typeof item === 'object' && (item._id || item.id));
    
    // FALLBACK: If population failed but user has wishlist IDs, fetch them manually
    if (wishlistItems.length === 0 && user.wishlist.length > 0) {
        console.warn(`[WishlistTrace] Populate failed, attempting manual fetch for ${user.wishlist.length} IDs`);
        // Re-fetch user without populate to get raw IDs
        const rawUser = await User.findById(req.userID).lean();
        if (rawUser && rawUser.wishlist && rawUser.wishlist.length > 0) {
            wishlistItems = await products.find({ 
                _id: { $in: rawUser.wishlist } 
            }).lean();
            console.log(`[WishlistTrace] Manual fetch found ${wishlistItems.length} items`);
        }
    }

    console.log(`[WishlistTrace] Final items count: ${wishlistItems.length}`);
    
    res.status(200).json({ 
        wishlist: wishlistItems, 
        data: wishlistItems, 
        count: wishlistItems.length 
    });
});

/**
 * Add or remove from wishlist
 */
exports.toggleWishlist = asyncHandler(async (req, res) => {
    const productId = req.params.id || req.body.productId;
    console.log(`[WishlistTrace] Toggling product: ${productId} for user: ${req.userID}`);

    if (!productId) {
        return res.status(400).json({ error: "Product ID is missing" });
    }

    let product;
    if (mongoose.Types.ObjectId.isValid(productId)) {
        product = await products.findById(productId);
    } else {
        product = await products.findOne({ id: productId });
    }

    if (!product) {
        console.error(`[WishlistTrace] Product not found in DB: ${productId}`);
        return res.status(404).json({ error: "Product not found" });
    }

    const targetIdToStore = product._id;
    console.log(`[WishlistTrace] Resolved Database _id: ${targetIdToStore}`);

    const user = await User.findById(req.userID);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.wishlist) user.wishlist = [];

    const index = user.wishlist.findIndex(
        (id) => id && id.toString() === targetIdToStore.toString()
    );
    let saved = false;

    if (index > -1) {
        user.wishlist.splice(index, 1);
        saved = false;
        console.log(`[WishlistTrace] Removed product from wishlist`);
    } else {
        user.wishlist.push(targetIdToStore);
        saved = true;
        console.log(`[WishlistTrace] Added product to wishlist`);
    }

    await user.save();
    console.log(`[WishlistTrace] Final wishlist IDs:`, user.wishlist);

    res.status(200).json({
        saved,
        wishlistCount: user.wishlist.length,
        message: saved ? "Added to wishlist" : "Removed from wishlist",
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
    let { page = 1, limit = 20, role, search } = req.query;

    // Enforce pagination bounds
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    let query = {};

    // Validate role filter against allowed values
    if (role) {
        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ error: "Invalid role filter" });
        }
        query.role = role;
    }

    if (search) {
        const searchRegex = new RegExp(
            search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i"
        );
        query.$or = [{ fname: searchRegex }, { email: searchRegex }];
    }

    const [users, totalItems] = await Promise.all([
        User.find(query)
            .select(SAFE_SELECT)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        User.countDocuments(query),
    ]);

    res.status(200).json({
        data: users.map(toPublicUser),
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }
    const user = await User.findById(req.params.id).select(SAFE_SELECT);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(toPublicUser(user));
});

/**
 * Admin: Create a new user
 */
exports.createUser = asyncHandler(async (req, res) => {
    const { fname, email, mobile, password, cpassword, role, country } = req.body;
    const validator = require("validator");

    if (!fname || !email || !mobile || !password || !cpassword) {
        return res.status(422).json({ error: "Please fill all details" });
    }

    if (!validator.isEmail(email)) {
        return res.status(422).json({ error: "Invalid email address" });
    }

    if (fname.trim().length < 2 || fname.trim().length > 100) {
        return res.status(422).json({ error: "Name must be 2–100 characters" });
    }

    if (password.length < 6 || password.length > 128) {
        return res.status(422).json({ error: "Password must be 6–128 characters" });
    }

    if (password !== cpassword) {
        return res.status(422).json({ error: "Passwords do not match" });
    }

    if (!/^\+?[\d\s\-()]{7,20}$/.test(mobile.toString())) {
        return res.status(422).json({ error: "Invalid mobile number" });
    }

    // Restrict role assignment: only "user" or "admin"
    const allowedRoles = ["user", "admin"];
    const assignedRole = role && allowedRoles.includes(role) ? role : "user";

    const preuser = await User.findOne({ email: email.toLowerCase().trim() });
    if (preuser) return res.status(422).json({ error: "This email already exists" });

    const premobile = await User.findOne({ mobile: mobile.toString().trim() });
    if (premobile) return res.status(422).json({ error: "This mobile already exists" });

    const user = new User({
        fname: fname.trim(),
        email: email.toLowerCase().trim(),
        mobile: mobile.toString().trim(),
        password,
        cpassword,
        role: assignedRole,
        country: country ? country.trim() : undefined,
    });

    await user.save();
    // Return only safe fields
    res.status(201).json({ success: true, data: toPublicUser(user) });
});

/**
 * Admin: Update user
 */
exports.updateUser = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { fname, email, role, country, mobile, password, cpassword } = req.body;
    const validator = require("validator");
    const bcrypt = require("bcryptjs");

    const updateFields = {};

    if (fname !== undefined) {
        const trimmed = fname.trim();
        if (trimmed.length < 2 || trimmed.length > 100) {
            return res.status(422).json({ error: "Name must be 2\u2013100 characters" });
        }
        updateFields.fname = trimmed;
    }

    if (email !== undefined) {
        const trimmedEmail = email.toLowerCase().trim();
        if (!validator.isEmail(trimmedEmail)) {
            return res.status(422).json({ error: "Invalid email address" });
        }
        // Only check duplicate if email is actually changing
        if (trimmedEmail !== user.email) {
            const existingEmail = await User.findOne({ email: trimmedEmail, _id: { $ne: user._id } });
            if (existingEmail) {
                return res.status(422).json({ error: "This email is already in use" });
            }
        }
        updateFields.email = trimmedEmail;
    }

    if (role !== undefined) {
        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }
        updateFields.role = role;
    }

    if (country !== undefined) {
        updateFields.country = country.trim().substring(0, 100);
    }

    if (mobile !== undefined) {
        const trimmedMobile = mobile.toString().trim();
        if (!/^\+?[\d\s\-()]{7,20}$/.test(trimmedMobile)) {
            return res.status(422).json({ error: "Invalid mobile number" });
        }
        if (trimmedMobile !== user.mobile) {
            const existingMobile = await User.findOne({ mobile: trimmedMobile, _id: { $ne: user._id } });
            if (existingMobile) {
                return res.status(422).json({ error: "This mobile number is already in use" });
            }
        }
        updateFields.mobile = trimmedMobile;
    }

    if (password !== undefined && password.trim()) {
        if (password.length < 6 || password.length > 128) {
            return res.status(422).json({ error: "Password must be 6\u2013128 characters" });
        }
        if (cpassword !== undefined && password !== cpassword) {
            return res.status(422).json({ error: "Passwords do not match" });
        }
        updateFields.password = await bcrypt.hash(password, 12);
        updateFields.cpassword = await bcrypt.hash(cpassword || password, 12);
    }

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
    }

    // Always stamp updatedAt
    updateFields.updatedAt = new Date();

    // Use raw MongoDB driver — bypasses ALL Mongoose middleware, hooks, and
    // unique-index caching that can silently block email changes
    await User.collection.updateOne(
        { _id: user._id },
        { $set: updateFields }
    );

    // Re-fetch fresh from DB to guarantee the returned document is up-to-date
    const updatedUser = await User.findById(req.params.id).select("-password -tokens -cpassword");

    res.status(200).json({ success: true, data: toPublicUser(updatedUser) });
});

/**
 * Admin: Delete user
 */
exports.deleteUser = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    // Prevent self-deletion
    if (req.params.id === req.userID.toString()) {
        return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ success: true, deletedUserId: user._id });
});

/**
 * Admin: Ban / Unban user
 */
exports.banUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    // Prevent self-banning
    if (id === req.userID.toString()) {
        return res.status(400).json({ error: "Cannot ban your own account" });
    }

    const { isBanned, banReason } = req.body;

    if (typeof isBanned !== "boolean") {
        return res.status(422).json({ error: "isBanned must be a boolean" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isBanned = isBanned;
    user.banReason = isBanned ? (banReason ? banReason.toString().trim().substring(0, 500) : "Violation of terms of service") : "";
    user.bannedAt = isBanned ? new Date() : null;

    // Revoke all sessions when banning
    if (isBanned) {
        user.tokens = [];
    }

    await user.save();
    // Return only safe fields — never return tokens/password
    res.status(200).json({ success: true, data: toPublicUser(user) });
});
