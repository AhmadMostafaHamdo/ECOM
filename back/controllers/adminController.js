const User = require("../models/userSchema");
const products = require("../models/productsSchema");
const Category = require("../models/categorySchema");
const Contact = require("../models/contactSchema");
const Review = require("../models/reviewSchema");
const { asyncHandler } = require("../middleware/errorMiddleware");

exports.getStats = asyncHandler(async (req, res) => {
    const [totalUsers, totalCategories, totalProducts, totalAdmins, totalCartItemsAgg] = await Promise.all([
        User.countDocuments(),
        Category.countDocuments(),
        products.countDocuments(),
        User.countDocuments({ role: "admin" }),
        User.aggregate([
            { $project: { cartCount: { $size: { $ifNull: ["$carts", []] } } } },
            { $group: { _id: null, total: { $sum: "$cartCount" } } },
        ]),
    ]);

    res.status(200).json({
        totalUsers,
        totalAdmins,
        totalCategories,
        totalProducts,
        totalCartItems: totalCartItemsAgg?.[0]?.total || 0,
    });
});

exports.getContactMessages = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status = "all", search = "" } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    let query = {};

    // Validate status against allowed values
    const allowedStatuses = ["all", "pending", "read", "replied"];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status filter" });
    }
    if (status !== "all") query.status = status;

    if (search) {
        const searchRegex = new RegExp(
            search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i"
        );
        query.$or = [
            { name: searchRegex },
            { email: searchRegex },
            { subject: searchRegex },
            { message: searchRegex },
        ];
    }

    const [messages, totalItems] = await Promise.all([
        Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        Contact.countDocuments(query),
    ]);

    res.status(200).json({
        data: messages,
        pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / limitNum),
            currentPage: pageNum,
            limit: limitNum,
        },
    });
});

exports.updateContactMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const message = await Contact.findById(id);
    if (!message) return res.status(404).json({ error: "Contact message not found" });

    // Validate status against allowed values
    if (status && !["pending", "read", "replied"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
    }
    if (status) message.status = status;

    if (adminNotes !== undefined) {
        message.adminNotes = adminNotes.toString().trim().substring(0, 2000);
    }

    await message.save();
    res.status(200).json({ success: true, data: message });
});

exports.deleteContactMessage = asyncHandler(async (req, res) => {
    const deletedMessage = await Contact.findByIdAndDelete(req.params.id);
    if (!deletedMessage) return res.status(404).json({ error: "Contact message not found" });
    res.status(200).json({ success: true, deletedMessageId: deletedMessage._id });
});

exports.getAllReviews = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Validate status against allowed values
    const allowedStatuses = ["pending", "approved", "rejected"];
    let query = {};
    if (status) {
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status filter" });
        }
        query.status = status;
    }

    const [reviews, totalItems] = await Promise.all([
        Review.find(query)
            .populate("reviewerId", "fname email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        Review.countDocuments(query),
    ]);

    res.status(200).json({
        data: reviews,
        page: pageNum,
        limit: limitNum,
        total: totalItems,
        total_pages: Math.ceil(totalItems / limitNum),
    });
});
