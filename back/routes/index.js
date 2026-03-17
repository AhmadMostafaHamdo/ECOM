const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const productRoutes = require("./productRoutes");
const categoryRoutes = require("./categoryRoutes");
const userRoutes = require("./userRoutes");
const cartRoutes = require("./cartRoutes");
const adminRoutes = require("./adminRoutes");
const conversationRoutes = require("./conversationRoutes");

// Mounting routes
router.use(authRoutes);
router.use(productRoutes);
router.use(categoryRoutes);
router.use(userRoutes);
router.use(cartRoutes);
router.use(adminRoutes);
router.use("/conversations", conversationRoutes);

module.exports = router;
