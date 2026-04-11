const User = require("../models/userSchema");
const products = require("../models/productsSchema");
const mongoose = require("mongoose");
const { toSessionUser } = require("../utils/helpers");
const { asyncHandler } = require("../middleware/errorMiddleware");

exports.addToCart = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || typeof id !== "string" || id.trim().length === 0) {
        return res.status(400).json({ error: "Invalid product ID" });
    }

    const cartProduct = await products.findOne({ id });
    if (!cartProduct) return res.status(404).json({ error: "Product not found" });

    const user = await User.findById(req.userID);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.addcartdata(cartProduct);
    await user.save();
    res.status(201).json(toSessionUser(user));
});

exports.getCartDetails = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userID);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(toSessionUser(user));
});

exports.removeFromCart = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || typeof id !== "string" || id.trim().length === 0) {
        return res.status(400).json({ error: "Invalid item ID" });
    }

    const user = req.rootUser;
    user.carts = user.carts.filter(
        (item) => item.id !== id && item._id.toString() !== id
    );
    await user.save();
    res.status(200).json(toSessionUser(user));
});
