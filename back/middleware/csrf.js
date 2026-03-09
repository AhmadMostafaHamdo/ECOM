const crypto = require("crypto");

module.exports = (req, res, next) => {
    // Generate token if not exists
    if (!req.cookies?.csrfToken) {
        const token = crypto.randomBytes(32).toString("hex");
        res.cookie("csrfToken", token, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            httpOnly: false
        });
        req.csrfToken = token;
    } else {
        req.csrfToken = req.cookies.csrfToken;
    }

    // Exempt safe methods and login/register from CSRF if you wish, or apply to all mutations
    const safeMethods = ["GET", "HEAD", "OPTIONS"];

    // Verify token for state-changing methods
    if (!safeMethods.includes(req.method)) {
        const exemptPaths = ["/login", "/register"];
        if (exemptPaths.includes(req.path)) {
            return next();
        }
        // Skip CSRF validation for file uploads (as multipart/form-data doesn't inherently include headers in simple forms without extra logic)
        // Or if the frontend is fully axios, it sends headers for everything.
        const receivedToken = req.headers["x-csrf-token"];

        if (!receivedToken || receivedToken !== req.csrfToken) {
            return res.status(403).json({ error: "Invalid CSRF Token. Request mitigated." });
        }
    }

    next();
};
