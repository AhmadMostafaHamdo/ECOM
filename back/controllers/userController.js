const User = require("../models/userSchema");
const { toPublicUser } = require("../utils/helpers");
const { USER_ROLES } = require("../utils/constants");

exports.getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        let query = {};
        if (search) {
            const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            query.$or = [{ fname: searchRegex }, { email: searchRegex }, { mobile: searchRegex }];
        }

        const [users, totalItems] = await Promise.all([
            User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            User.countDocuments(query),
        ]);

        res.status(200).json({
            data: users.map(toPublicUser),
            page: pageNum,
            limit: limitNum,
            total: totalItems,
            total_pages: Math.ceil(totalItems / limitNum),
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json(toPublicUser(user));
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user details" });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { fname, email, mobile, password, cpassword, role } = req.body;
        if (!fname || !email || !mobile || !password) return res.status(422).json({ error: "Name, email, mobile and password are required" });

        if (password !== (cpassword || password)) return res.status(422).json({ error: "Passwords do not match" });

        const safeRole = USER_ROLES.has(role) ? role : "user";
        const user = new User({ fname, email, mobile, password, cpassword: cpassword || password, role: safeRole });
        const savedUser = await user.save();
        res.status(201).json(toPublicUser(savedUser));
    } catch (error) {
        if (error?.code === 11000) return res.status(409).json({ error: "Email or mobile already exists" });
        res.status(500).json({ error: "Failed to create user" });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        const { fname, email, mobile, password, cpassword, role } = req.body;
        if (fname) user.fname = fname.trim();
        if (email) user.email = email.trim();
        if (mobile) user.mobile = mobile.toString().trim();
        if (role && USER_ROLES.has(role)) user.role = role;

        if (typeof password === "string" && password.trim()) {
            if (password !== (cpassword || password)) return res.status(422).json({ error: "Passwords do not match" });
            user.password = password;
            user.cpassword = cpassword || password;
        }

        const updatedUser = await user.save();
        res.status(200).json(toPublicUser(updatedUser));
    } catch (error) {
        if (error?.code === 11000) return res.status(409).json({ error: "Email or mobile already exists" });
        res.status(500).json({ error: "Failed to update user" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ error: "User not found" });
        res.status(200).json({ success: true, deletedUserId: deletedUser._id });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
    }
};

exports.banUser = async (req, res) => {
    try {
        const { isBanned, banReason } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.isBanned = isBanned;
        user.banReason = isBanned ? banReason : "";
        user.bannedAt = isBanned ? new Date() : null;
        await user.save();
        res.status(200).json(toPublicUser(user));
    } catch (error) {
        res.status(500).json({ error: "Failed to ban/unban user" });
    }
};
