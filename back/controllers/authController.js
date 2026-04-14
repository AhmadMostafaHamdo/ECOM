const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { toSessionUser, ONE_YEAR_MS } = require("../utils/helpers");
const { asyncHandler } = require("../middleware/errorMiddleware");

// Reusable cookie options builder
const buildCookieOptions = () => ({
    expires: new Date(Date.now() + ONE_YEAR_MS),
    maxAge: ONE_YEAR_MS,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
});

/**
 * @desc    Register a new user
 * @route   POST /api/register
 */
exports.register = asyncHandler(async (req, res) => {
    let { fname, email, mobile, password, cpassword, country } = req.body;
    fname = fname?.trim();
    email = email?.toLowerCase().trim();
    mobile = mobile?.toString().trim();
    country = country?.trim();

    // Basic presence check
    if (!fname || !email || !mobile || !password || !cpassword) {
        return res.status(422).json({ error: "Please fill all details" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
        return res.status(422).json({ error: "Invalid email address" });
    }

    // Validate full name length
    if (fname.trim().length < 2 || fname.trim().length > 100) {
        return res.status(422).json({ error: "Name must be 2–100 characters" });
    }

    // Validate password length
    if (password.length < 6 || password.length > 128) {
        return res.status(422).json({ error: "Password must be 6–128 characters" });
    }

    if (password !== cpassword) {
        return res.status(422).json({ error: "Passwords do not match" });
    }

    // Validate mobile (digits only, 7-20 chars)
    if (!/^\+?[\d\s\-()]{7,20}$/.test(mobile.toString())) {
        return res.status(422).json({ error: "Invalid mobile number" });
    }

    const preuser = await User.findOne({ email: email.toLowerCase().trim() });
    if (preuser) {
        return res.status(422).json({ error: "This email already exists" });
    }

    const premobile = await User.findOne({ mobile: mobile.toString().trim() });
    if (premobile) {
        return res.status(422).json({ error: "This mobile already exists" });
    }

    const totalUsers = await User.countDocuments();
    const finaluser = new User({
        fname: fname.trim(),
        email: email.toLowerCase().trim(),
        mobile: mobile.toString().trim(),
        password,
        cpassword,
        country: country ? country.trim() : undefined,
        role: totalUsers === 0 ? "admin" : "user",
    });

    const storedata = await finaluser.save();
    const token = await storedata.generatAuthtoken();

    res.cookie("eccomerce", token, buildCookieOptions());
    return res.status(201).json({ success: true, ...toSessionUser(storedata, token) });
});

/**
 * @desc    Get an admin user (Public)
 * @route   GET /api/getadmin
 */
exports.getAdmin = asyncHandler(async (req, res) => {
    const admin = await User.findOne({ role: "admin" }).select("_id fname email");
    if (!admin) return res.status(404).json({ error: "No admin found" });
    res.status(200).json(admin);
});

/**
 * @desc    Login user
 * @route   POST /api/login
 */
exports.login = asyncHandler(async (req, res) => {
    let { email, password } = req.body;
    email = email?.toLowerCase().trim();

    if (!email || !password) {
        return res.status(400).json({ error: "Please fill the details" });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Invalid email address" });
    }

    const userlogin = await User.findOne({ email: email.toLowerCase().trim() });
    if (!userlogin) {
        // Generic message to prevent user enumeration
        return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check if user is banned before allowing login
    if (userlogin.isBanned) {
        return res.status(403).json({
            error: "Account suspended",
            message: `Your account is suspended. Reason: ${userlogin.banReason || "Violation of terms of service"}`,
            banned: true,
        });
    }

    const isMatch = await bcrypt.compare(password, userlogin.password);
    if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = await userlogin.generatAuthtoken();
    res.cookie("eccomerce", token, buildCookieOptions());
    res.status(200).json({ success: true, ...toSessionUser(userlogin, token) });
});

/**
 * @desc    Logout user
 * @route   POST /api/logout
 */
exports.logout = asyncHandler(async (req, res) => {
    req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
        return curelem.token !== req.token;
    });

    res.clearCookie("eccomerce", { path: "/" });
    await req.rootUser.save();
    res.status(200).json({ success: true });
});

/**
 * @desc    Get user profile
 * @route   GET /api/profile
 */
exports.getProfile = asyncHandler(async (req, res) => {
    res.status(200).json(toSessionUser(req.rootUser));
});

/**
 * @desc    Update user profile
 * @route   PUT /api/profile
 */
exports.updateProfile = asyncHandler(async (req, res) => {
    const { fname, mobile, country } = req.body;
    const user = req.rootUser;

    // Do NOT allow email change through this endpoint to prevent account hijacking
    if (fname) {
        const trimmed = fname.trim();
        if (trimmed.length < 2 || trimmed.length > 100) {
            return res.status(422).json({ error: "Name must be 2–100 characters" });
        }
        user.fname = trimmed;
    }

    if (mobile) {
        const trimmedMobile = mobile.toString().trim();
        if (!/^\+?[\d\s\-()]{7,20}$/.test(trimmedMobile)) {
            return res.status(422).json({ error: "Invalid mobile number" });
        }
        // Check uniqueness
        const existingMobile = await User.findOne({ mobile: trimmedMobile, _id: { $ne: user._id } });
        if (existingMobile) {
            return res.status(422).json({ error: "This mobile number is already in use" });
        }
        user.mobile = trimmedMobile;
    }

    if (country) {
        const trimmedCountry = country.trim();
        if (trimmedCountry.length > 100) {
            return res.status(422).json({ error: "Country name too long" });
        }
        user.country = trimmedCountry;
    }

    const updatedUser = await user.save();
    res.status(200).json(toSessionUser(updatedUser));
});

/**
 * @desc    Validate session
 * @route   GET /api/validuser
 */
exports.validateUser = asyncHandler(async (req, res) => {
    res.status(200).json(toSessionUser(req.rootUser));
});
