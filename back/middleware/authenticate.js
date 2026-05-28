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
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }
        }

        console.log("[AUTH MIDDLEWARE] URL:", req.url);
        console.log("[AUTH MIDDLEWARE] Auth header present:", !!authHeader);
        if (authHeader) console.log("[AUTH MIDDLEWARE] Header starts with Bearer:", authHeader.startsWith("Bearer "));
        console.log("[AUTH MIDDLEWARE] Token extracted:", token ? `${token.substring(0, 15)}...` : "NONE");

        if (!token) {
            console.log("Auth failed: Authorization header missing or malformed.");
            return res.status(401).json({ error: "Unauthorized: token missing" });
        }

        const secret = process.env.JWT_SECRET || process.env.KEY;
        console.log("[AUTH MIDDLEWARE] Secret used for verify (first 5 chars):", secret ? secret.substring(0,5) : "NONE");
        
        let decoded;
        try {
            decoded = jwt.verify(token, secret);
            console.log("[AUTH MIDDLEWARE] Token decoded successfully:", decoded);
        } catch (verifyErr) {
            console.log("[AUTH MIDDLEWARE] JWT Verify Error:", verifyErr.message);
            throw verifyErr;
        }

        const userId = decoded.id || decoded._id;

        const rootUser = await User.findOne({ _id: userId, "tokens.token": token });

        if (!rootUser) {
            console.log(`[AUTH MIDDLEWARE] User not found for id: ${userId} AND token match.`);
            const userWithoutToken = await User.findOne({ _id: decoded.id });
            console.log(`[AUTH MIDDLEWARE] Does user exist at all? ${!!userWithoutToken}`);
            if (userWithoutToken) {
                console.log(`[AUTH MIDDLEWARE] User tokens length: ${userWithoutToken.tokens?.length}`);
                if (userWithoutToken.tokens?.length > 0) {
                    console.log(`[AUTH MIDDLEWARE] First token starts with: ${userWithoutToken.tokens[0].token.substring(0,15)}...`);
                }
            }
            clearAuthCookie(res);
            return res.status(401).json({ error: "Unauthorized: invalid token" });
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

        console.log("[AUTH MIDDLEWARE] Authentication successful for user:", rootUser.email);
        req.token = token;
        // Attach decoded to req.user as per user's request
        req.user = decoded;
        
        // Retain req.rootUser and req.userID for backward compatibility with other routes
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
        let token = req.cookies.eccomerce;
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }
        }

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.KEY);
        const userId = decoded.id || decoded._id;
        const rootUser = await User.findOne({ _id: userId, "tokens.token": token });

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
