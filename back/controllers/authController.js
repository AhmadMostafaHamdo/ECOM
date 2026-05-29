const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { toSessionUser, ONE_YEAR_MS, clearAuthCookie } = require("../utils/helpers");
const { asyncHandler } = require("../middleware/errorMiddleware");

const isProduction = process.env.NODE_ENV === "production";

const buildCookieOptions = () => {
  const options = {
    expires: new Date(Date.now() + ONE_YEAR_MS),
    maxAge: ONE_YEAR_MS,
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    path: "/",
  };

  const cookieDomain = process.env.COOKIE_DOMAIN?.trim();
  if (cookieDomain) options.domain = cookieDomain;

  return options;
};

exports.register = asyncHandler(async (req, res) => {
  let { fname, email, mobile, password, cpassword, country } = req.body;

  fname = fname?.trim();
  email = email?.toLowerCase().trim();
  mobile = mobile?.toString().trim();
  country = country?.trim();

  if (!fname || !email || !mobile || !password || !cpassword) {
    return res.status(422).json({ error: "Please fill all details" });
  }

  if (!validator.isEmail(email)) {
    return res.status(422).json({ error: "Invalid email address" });
  }

  if (fname.length < 2 || fname.length > 100) {
    return res.status(422).json({ error: "Name must be 2–100 characters" });
  }

  if (password.length < 6) {
    return res.status(422).json({ error: "Password must be at least 6 characters" });
  }

  if (password !== cpassword) {
    return res.status(422).json({ error: "Passwords do not match" });
  }

  if (!/^\+?[\d\s\-()]{7,20}$/.test(mobile)) {
    return res.status(422).json({ error: "Invalid mobile number" });
  }

  const preuser = await User.findOne({ email });
  if (preuser) {
    return res.status(422).json({ error: "This email already exists" });
  }

  const premobile = await User.findOne({ mobile });
  if (premobile) {
    return res.status(422).json({ error: "This mobile already exists" });
  }

  const finaluser = new User({
    fname,
    email,
    mobile,
    password,
    cpassword,
    country: country || undefined,
    role: "user",
  });

  const storedata = await finaluser.save();
  const token = await storedata.generatAuthtoken();

  res.cookie("eccomerce", token, buildCookieOptions());
  return res.status(201).json({ success: true, ...toSessionUser(storedata, token) });
});

exports.getAdmin = asyncHandler(async (req, res) => {
  const admin = await User.findOne({ role: "admin" }).select("_id fname email");
  if (!admin) return res.status(404).json({ error: "No admin found" });

  return res.status(200).json(admin);
});

exports.login = asyncHandler(async (req, res) => {
  let { email, password } = req.body;
  email = email?.toLowerCase().trim();

  if (!email || !password) {
    return res.status(400).json({ error: "Please fill the details" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const userlogin = await User.findOne({ email });
  if (!userlogin) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  if (userlogin.isBanned) {
    clearAuthCookie(res);
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
  return res.status(200).json({ success: true, ...toSessionUser(userlogin, token) });
});

exports.logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  return res.status(200).json({ success: true });
});

exports.getProfile = asyncHandler(async (req, res) => {
  return res.status(200).json(toSessionUser(req.rootUser));
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { fname, mobile, country } = req.body;
  const user = req.rootUser;

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

    const existingMobile = await User.findOne({
      mobile: trimmedMobile,
      _id: { $ne: user._id },
    });

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
  return res.status(200).json(toSessionUser(updatedUser));
});

exports.validateUser = asyncHandler(async (req, res) => {
  return res.status(200).json(toSessionUser(req.rootUser, req.token));
});