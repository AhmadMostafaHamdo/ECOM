const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const { clearAuthCookie } = require("../utils/helpers");

const getLatestAuthToken = (req) => {
    const rawCookie = req.headers.cookie || "";

    const tokens = rawCookie
        .split(";")
        .map((item) => item.trim())
        .filter((item) => item.startsWith("eccomerce="))
        .map((item) => decodeURIComponent(item.split("=").slice(1).join("=")))
        .filter(Boolean);

    return tokens.length ? tokens[tokens.length - 1] : req.cookies?.eccomerce;
};

const authenicate = async (req, res, next) => {
    try {
        const token = getLatestAuthToken(req);

        console.log("[AUTH DEBUG]", {
            hasCookieHeader: Boolean(req.headers.cookie),
            parsedCookie: Boolean(req.cookies?.eccomerce),
            selectedTokenStart: token?.slice(0, 25),
            origin: req.headers.origin,
            cookieDomain: process.env.COOKIE_DOMAIN,
        });

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

        if (rootUser.isBanned) {
            clearAuthCookie(res);
            return res.status(403).json({
                error: "Account suspended",
                message: `حسابك محظور. السبب: ${rootUser.banReason || "انتهاك شروط الخدمة"}`,
                banned: true,
            });
        }

        req.token = token;
        req.user = decoded;
        req.rootUser = rootUser;
        req.userID = rootUser._id;

        return next();
    } catch (error) {
        console.log("[AUTH MIDDLEWARE] Final catch block error:", error.message);
        clearAuthCookie(res);
        return res.status(401).json({ error: "Unauthorized: token invalid or expired" });
    }
};

const optionalAuthenticate = async (req, res, next) => {
    try {
        const token = getLatestAuthToken(req);

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