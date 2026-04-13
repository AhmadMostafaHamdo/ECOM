const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const productRoutes = require("./productRoutes");
const categoryRoutes = require("./categoryRoutes");
const userRoutes = require("./userRoutes");
const cartRoutes = require("./cartRoutes");
const adminRoutes = require("./adminRoutes");
const contactRoutes = require("./contactRoutes");
const reviewRoutes = require("./reviewRoutes");
const commentRoutes = require("./commentRoutes");
const reportRoutes = require("./reportRoutes");
const conversationRoutes = require("./conversationRoutes");
const uploadRoutes = require("./uploadRoutes");

// Mounting routes
router.use(authRoutes);
router.use(productRoutes);
router.use(categoryRoutes);
router.use(userRoutes);
router.use(cartRoutes);
router.use(adminRoutes);
router.use(contactRoutes);
router.use(reviewRoutes);
router.use(commentRoutes);
router.use(reportRoutes);
router.use("/conversations", conversationRoutes);
router.use(uploadRoutes);

module.exports = router;
