const User = require("../models/userSchema");
const products = require("../models/productsSchema");
const { toSessionUser } = require("../utils/helpers");

exports.addToCart = async (req, res) => {
    try {
        const { id } = req.params;
        const cartProduct = await products.findOne({ id });
        if (!cartProduct) return res.status(404).json({ error: "Product not found" });

        const user = await User.findById(req.userID);
        if (!user) return res.status(404).json({ error: "User not found" });

        await user.addcartdata(cartProduct);
        await user.save();
        res.status(201).json(toSessionUser(user));
    } catch (error) {
        console.error("Add to cart error:", error.message);
        res.status(500).json({ error: "Failed to add item to cart" });
    }
};

exports.getCartDetails = async (req, res) => {
    try {
        const user = await User.findById(req.userID);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json(toSessionUser(user));
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch cart details" });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.rootUser;
        user.carts = user.carts.filter(item => item.id !== id && item._id.toString() !== id);
        await user.save();
        res.status(200).json(toSessionUser(user));
    } catch (error) {
        res.status(500).json({ error: "Failed to remove item from cart" });
    }
};
