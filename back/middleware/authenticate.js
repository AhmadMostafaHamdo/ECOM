const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const keysecret = process.env.KEY

const isProduction = process.env.NODE_ENV === "production";

const normalizeCookieDomain = (domain) => {
    if (!domain) return undefined;
    const trimmed = domain.trim();
    if (!trimmed) return undefined;
    if (trimmed === "localhost" || trimmed.endsWith(".localhost")) return undefined;
    if (!trimmed.includes(".")) return undefined;
    return trimmed.startsWith(".") ? trimmed : `.${trimmed}`;
};

const deriveCookieDomainFromOrigins = () => {
    const origins = (process.env.CLIENT_ORIGINS || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

    const candidates = [];
    for (const origin of origins) {
        try {
            const url = new URL(origin);
            let host = url.hostname;
            if (!host || host === "localhost" || host === "127.0.0.1") continue;
            if (host.startsWith("www.")) host = host.slice(4);
            const normalized = normalizeCookieDomain(host);
            if (normalized) candidates.push(normalized);
        } catch {
            // ignore invalid origins
        }
    }

    candidates.sort((a, b) => a.length - b.length);
    return candidates[0];
};

const authCookieDomain =
    normalizeCookieDomain(process.env.COOKIE_DOMAIN) ||
    (isProduction ? deriveCookieDomainFromOrigins() : undefined);

const clearAuthCookie = (res) => {
    const options = {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
        path: "/",
    };

    if (authCookieDomain) {
        options.domain = authCookieDomain;
    }

    res.clearCookie("eccomerce", options);
};

const authenicate = async (req, res, next) => {
    try {
        let token = req.cookies.eccomerce;
        
        // Fallback to Authorization header if cookie is missing
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            console.log("Auth failed: eccomerce cookie missing. Cookies received:", req.cookies);
            return res.status(401).json({ error: "Unauthorized: token missing" });
        }

        const verifyToken = jwt.verify(token, keysecret);

        const rootUser = await User.findOne({ _id: verifyToken._id, "tokens.token": token });

        if (!rootUser) {
            clearAuthCookie(res);
            return res.status(401).json({ error: "Unauthorized: invalid token" });
        }

        // Check if user is banned
        if (rootUser.isBanned) {
            clearAuthCookie(res);
            return res.status(403).json({
                error: "Account suspended",
                message: `حسابك محظور. السبب: ${rootUser.banReason || "انتهاك شروط الخدمة"}`,
                banned: true
            });
        }

        req.token = token;
        req.rootUser = rootUser;
        req.userID = rootUser._id;

        next();

    } catch (error) {
        clearAuthCookie(res);
        res.status(401).json({ error: "Unauthorized: token invalid or expired" });
        console.log(error);
    }
};

const optionalAuthenticate = async (req, res, next) => {
    try {
        let token = req.cookies.eccomerce;

        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return next();
        }

        const verifyToken = jwt.verify(token, keysecret);
        const rootUser = await User.findOne({ _id: verifyToken._id, "tokens.token": token });

        if (!rootUser || rootUser.isBanned) {
            clearAuthCookie(res);
            return next();
        }

        req.token = token;
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
