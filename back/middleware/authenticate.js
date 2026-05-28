const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const isProduction = process.env.NODE_ENV === "production";
const cookieDomain = process.env.COOKIE_DOMAIN ? process.env.COOKIE_DOMAIN.trim() : undefined;

const clearAuthCookie = (res) => {
    const options = {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
        path: "/",
    };

    if (cookieDomain) {
        options.domain = cookieDomain;
    }

    res.clearCookie("eccomerce", options);
};

const authenicate = async (req, res, next) => {
    try {
        const token = req.cookies?.eccomerce;

        if (!token) {
            console.log("Auth failed: Cookie missing.");
            return res.status(401).json({ error: "Unauthorized: token missing" });
        }

        const secret = process.env.JWT_SECRET || process.env.KEY;
        
        let decoded;
        try {
            decoded = jwt.verify(token, secret);
        } catch (verifyErr) {
            console.log("[AUTH MIDDLEWARE] JWT Verify Error:", verifyErr.message);
            throw verifyErr;
        }

        const userId = decoded.id || decoded._id;

        const rootUser = await User.findById(userId);

        if (!rootUser) {
            console.log(`[AUTH MIDDLEWARE] User not found for id: ${userId}`);
            clearAuthCookie(res);
            return res.status(401).json({ error: "Unauthorized: invalid user" });
        }

        // Check if user is banned
        if (rootUser.isBanned) {
            console.log("[AUTH MIDDLEWARE] User is banned.");
            clearAuthCookie(res);
            return res.status(403).json({
                error: "Account suspended",
                message: `حسابك محظور. السبب: ${rootUser.banReason || "انتهاك شروط الخدمة"}`,
                banned: true
            });
        }

        req.token = token;
        req.user = decoded;
        req.rootUser = rootUser;
        req.userID = rootUser._id;

        next();
    } catch (error) {
        console.log("[AUTH MIDDLEWARE] Final catch block error:", error.message);
        clearAuthCookie(res);
        res.status(401).json({ error: "Unauthorized: token invalid or expired" });
    }
};

const optionalAuthenticate = async (req, res, next) => {
    try {
        const token = req.cookies?.eccomerce;

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.KEY);
        const userId = decoded.id || decoded._id;
        const rootUser = await User.findById(userId);

        if (!rootUser || rootUser.isBanned) {
            clearAuthCookie(res);
            return next();
        }

        req.token = token;
        req.user = decoded;
        req.rootUser = rootUser;
        req.userID = rootUser._id;
        return next();
    } catch (error) {
        clearAuthCookie(res);
        return next();
    }
};

authenicate.optional = optionalAuthenticate;
module.exports = authenicate;
