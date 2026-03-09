const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const { toSessionUser, ONE_YEAR_MS } = require("../utils/helpers");
const { asyncHandler } = require("../middleware/errorMiddleware");

/**
 * @desc    Register a new user
 * @route   POST /api/register
 */
exports.register = asyncHandler(async (req, res) => {
    const { fname, email, mobile, password, cpassword, country } = req.body;

    if (!fname || !email || !mobile || !password || !cpassword) {
        return res.status(422).json({ error: "Please fill all details" });
    }

    const preuser = await User.findOne({ email });
    const premobile = await User.findOne({ mobile });

    if (preuser) {
        return res.status(422).json({ error: "This email already exists" });
    }
    if (premobile) {
        return res.status(422).json({ error: "This mobile already exists" });
    }
    if (password !== cpassword) {
        return res.status(422).json({ error: "Passwords do not match" });
    }

    const totalUsers = await User.countDocuments();
    const finaluser = new User({
        fname,
        email,
        mobile,
        password,
        cpassword,
        country,
        role: totalUsers === 0 ? "admin" : "user",
    });

    const storedata = await finaluser.save();
    const token = await storedata.generatAuthtoken();

    res.cookie("eccomerce", token, {
        expires: new Date(Date.now() + ONE_YEAR_MS),
        maxAge: ONE_YEAR_MS,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
    });

    return res.status(201).json(toSessionUser(storedata, token));
});

/**
 * @desc    Login user
 * @route   POST /api/login
 */
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Please fill the details" });
    }

    const userlogin = await User.findOne({ email });
    if (!userlogin) {
        return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, userlogin.password);
    if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = await userlogin.generatAuthtoken();
    res.cookie("eccomerce", token, {
        expires: new Date(Date.now() + ONE_YEAR_MS),
        maxAge: ONE_YEAR_MS,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json(toSessionUser(userlogin, token));
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
 * @route   PATCH /api/profile
 */
exports.updateProfile = asyncHandler(async (req, res) => {
    const { fname, email, mobile, country } = req.body;
    const user = req.rootUser;

    if (fname) user.fname = fname.trim();
    if (email) user.email = email.trim();
    if (mobile) user.mobile = mobile.toString().trim();
    if (country) user.country = country.trim();

    const updatedUser = await user.save();
    res.status(200).json(toSessionUser(updatedUser));
});

/**
 * @desc    Validate session
 * @route   GET /api/validateuser
 */
exports.validateUser = asyncHandler(async (req, res) => {
    res.status(200).json(toSessionUser(req.rootUser));
});
