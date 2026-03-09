const User = require("../models/userSchema");
const products = require("../models/productsSchema");
const Category = require("../models/categorySchema");
const Contact = require("../models/contactSchema");
const Review = require("../models/reviewSchema");

exports.getStats = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch statistics" });
    }
};

exports.getContactMessages = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = "all", search = "" } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        let query = {};
        if (status !== "all") query.status = status;
        if (search) {
            const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            query.$or = [{ name: searchRegex }, { email: searchRegex }, { subject: searchRegex }, { message: searchRegex }];
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
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch contact messages" });
    }
};

exports.updateContactMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        const message = await Contact.findById(id);
        if (!message) return res.status(404).json({ error: "Contact message not found" });

        if (status && ["pending", "read", "replied"].includes(status)) message.status = status;
        if (adminNotes !== undefined) message.adminNotes = adminNotes;
        await message.save();

        res.status(200).json({ success: true, data: message });
    } catch (error) {
        res.status(500).json({ error: "Failed to update contact message" });
    }
};

exports.deleteContactMessage = async (req, res) => {
    try {
        const deletedMessage = await Contact.findByIdAndDelete(req.params.id);
        if (!deletedMessage) return res.status(404).json({ error: "Contact message not found" });
        res.status(200).json({ success: true, deletedMessageId: deletedMessage._id });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete contact message" });
    }
};

exports.getAllReviews = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const query = status ? { status } : {};
        const [reviews, totalItems] = await Promise.all([
            Review.find(query).populate("reviewerId", "fname email").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            Review.countDocuments(query),
        ]);

        res.status(200).json({
            data: reviews,
            page: pageNum,
            limit: limitNum,
            total: totalItems,
            total_pages: Math.ceil(totalItems / limitNum),
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch all reviews" });
    }
};
