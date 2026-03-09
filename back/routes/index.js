const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const productRoutes = require("./productRoutes");
const categoryRoutes = require("./categoryRoutes");
const userRoutes = require("./userRoutes");
const cartRoutes = require("./cartRoutes");
const adminRoutes = require("./adminRoutes");

// Mounting routes
router.use(authRoutes);
router.use(productRoutes);
router.use(categoryRoutes);
router.use(userRoutes);
router.use(cartRoutes);
router.use(adminRoutes);

module.exports = router;
