const User = require("../models/userSchema");

const requireAdmin = async (req, res, next) => {
    try {
        if (req.rootUser?.role === "admin") {
            return next();
        }

        // Bootstrap path: if no admin exists, promote the current authenticated user.
        const adminsCount = await User.countDocuments({ role: "admin" });
        if (!adminsCount && req.rootUser) {
            req.rootUser.role = "admin";
            await req.rootUser.save();
            return next();
        }

        return res.status(403).json({ error: "Admin access required" });
    } catch (error) {
        console.error("Admin verification error:", error.message);
        return res.status(500).json({ error: "Failed to verify admin access" });
    }
};

module.exports = requireAdmin;
