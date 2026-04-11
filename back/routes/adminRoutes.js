const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { cacheMiddleware, clearCache } = require("../middleware/cacheMiddleware");
const adminController = require("../controllers/adminController");
const { asyncHandler } = require("../middleware/errorMiddleware");
const authenticate = require("../middleware/authenticate");
const requireAdmin = require("../middleware/admin");
const Category = require("../models/categorySchema");
const products = require("../models/productsSchema");
const User = require("../models/userSchema");
const { resolveProductCategory, buildProductPayload, escapeRegex: escapeRx, normalizeCategory: normalizecat, optimizeImage } = require("../utils/helpers");
const { CATEGORY_ALL, UNCATEGORIZED } = require("../utils/constants");
const upload = require("../middleware/upload");

// Helper functions
const normalizeCategory = (value = "") => value.toString().trim().toLowerCase();
const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getCategoryDashboardPayload = async (categories = null) => {
  const [categoryDocs, productsData] = await Promise.all([
    categories || Category.find().sort({ name: 1 }).lean(),
    products.find({}, { category: 1, title: 1 }).lean(),
  ]);

  const productCountByCategory = productsData.reduce((acc, product) => {
    const categoryName = product.category || "Uncategorized";
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {});

  return categoryDocs.map((categoryDoc) => ({
    _id: categoryDoc._id,
    name: categoryDoc.name,
    image: categoryDoc.image || "",
    productCount: productCountByCategory[categoryDoc.name] || 0,
  }));
};

router.get(
  "/admin/stats",
  authenticate,
  requireAdmin,
  cacheMiddleware(3600),
  adminController.getStats,
); // Cache for 1 hour

// Contact messages
router.get(
  "/admin/contact/messages",
  authenticate,
  requireAdmin,
  cacheMiddleware(300),
  adminController.getContactMessages,
);
router.put(
  "/admin/contact/messages/:id",
  authenticate,
  requireAdmin,
  adminController.updateContactMessage,
);
router.delete(
  "/admin/contact/messages/:id",
  authenticate,
  requireAdmin,
  adminController.deleteContactMessage,
);

// Review management
router.get(
  "/admin/reviews",
  authenticate,
  requireAdmin,
  cacheMiddleware(600),
  adminController.getAllReviews,
);

// Categories management
router.get(
  "/admin/categories",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
      const skip = (pageNum - 1) * limitNum;

      let query = {};
      if (search) {
        const searchRegex = new RegExp(escapeRegex(search), "i");
        query.name = searchRegex;
      }

      const [categories, totalItems] = await Promise.all([
        Category.find(query).sort({ name: 1 }).skip(skip).limit(limitNum),
        Category.countDocuments(query),
      ]);

      const payload = await getCategoryDashboardPayload(categories);

      res.status(200).json({
        data: payload,
        page: pageNum,
        limit: limitNum,
        total: totalItems,
        total_pages: Math.ceil(totalItems / limitNum),
      });
    } catch (error) {
      console.error("[Admin] Failed to fetch categories:", error.message);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  }),
);


router.post(
  "/admin/categories",
  authenticate,
  requireAdmin,
  upload.single("imageFile"),
  asyncHandler(async (req, res) => {
    try {
      const name = req.body?.name?.toString() || "";
      let image = req.body?.image?.toString() || "";

      // Handle file upload
      if (req.file) {
        const filename = await optimizeImage(req.file.buffer, req.file.originalname);
        image = `/uploads/${filename}`;
      }

      if (!name || name.trim().length < 2) {
        return res
          .status(422)
          .json({ error: "Category name must be at least 2 characters" });
      }

      if (name.trim().length > 50) {
        return res.status(422).json({ error: "Category name must be at most 50 characters" });
      }

      const existingCategory = await Category.findOne({
        normalizedName: name.trim().toLowerCase(),
      });
      if (existingCategory) {
        return res.status(409).json({ error: "Category already exists" });
      }

      const newCategory = new Category({
        name: name.trim(),
        image: image ? image.trim().substring(0, 2048) : "",
      });

      await newCategory.save();
      res.status(201).json(newCategory);
    } catch (error) {
      console.error("[AdminAPI] Failed to create category:", error.message);
      res.status(500).json({ 
        error: "Failed to create category",
        message: error.message 
      });
    }
  }),
);


router.put(
  "/admin/categories/:id",
  authenticate,
  requireAdmin,
  upload.single("imageFile"),
  async (req, res) => {
    try {
      const { name, image: imageBody } = req.body;
      const categoryId = req.params.id;
      let image = imageBody;

      // Handle file upload
      if (req.file) {
        const filename = await optimizeImage(req.file.buffer, req.file.originalname);
        image = `/uploads/${filename}`;
      }

      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ error: "Invalid category ID" });
      }

      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      if (name) {
        const trimmedName = name.trim();
        if (trimmedName.length < 2) {
          return res.status(422).json({ error: "Category name must be at least 2 characters" });
        }
        if (trimmedName.length > 100) {
          return res.status(422).json({ error: "Category name must be at most 100 characters" });
        }
        const duplicate = await Category.findOne({
          normalizedName: trimmedName.toLowerCase(),
          _id: { $ne: category._id },
        });
        if (duplicate) {
          return res.status(409).json({ error: "Category already exists" });
        }
        category.name = trimmedName;
      }

      if (image !== undefined) {
        category.image = image.trim().substring(0, 2048);
      }

      await category.save();
      res.status(200).json(category);
    } catch (error) {
      console.error("[Admin] Failed to update category:", error.message);
      res.status(500).json({ error: "Failed to update category" });
    }
  },
);

router.delete(
  "/admin/categories/:id",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const categoryId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ error: "Invalid category ID" });
      }

      const category = await Category.findById(categoryId);

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      // Move products to "Uncategorized"
      await products.updateMany(
        { category: { $regex: `^${escapeRx(category.name)}$`, $options: "i" } },
        { $set: { category: "Uncategorized" } },
      );

      await Category.findByIdAndDelete(categoryId);

      res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      console.error("[Admin] Failed to delete category:", error.message);
      res.status(500).json({ error: "Failed to delete category" });
    }
  },
);

// ─── Admin Products Management ──────────────────────────────────────────────

router.get("/admin/products", authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", category = "" } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const clauses = [];

    if (category && normalizecat(category) !== normalizecat(CATEGORY_ALL)) {
      clauses.push({ category: { $regex: `^${escapeRx(category)}$`, $options: "i" } });
    }

    if (search) {
      const searchRegex = new RegExp(escapeRx(search), "i");
      clauses.push({
        $or: [
          { "title.shortTitle": searchRegex },
          { "title.longTitle": searchRegex },
          { description: searchRegex },
          { tagline: searchRegex },
        ],
      });
    }

    const query = clauses.length ? { $and: clauses } : {};

    const [productsData, totalItems] = await Promise.all([
      products.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      products.countDocuments(query),
    ]);

    res.status(200).json({
      data: productsData.map(resolveProductCategory),
      page: pageNum,
      limit: limitNum,
      total: totalItems,
      total_pages: Math.ceil(totalItems / limitNum),
    });
  } catch (error) {
    console.error("[Admin] Failed to fetch products:", error.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.post("/admin/products", authenticate, requireAdmin, async (req, res) => {
  try {
    const payload = buildProductPayload(req.body);

    if (!payload?.title?.shortTitle) {
      return res.status(422).json({ error: "Product title is required" });
    }

    const generateProductId = () =>
      `product_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    const product = await products.create({
      id: req.body?.id ? req.body.id.toString().trim() : generateProductId(),
      ...payload,
      createdBy: req.userID,
    });

    clearCache("/api/getproducts");
    clearCache("/api/products/trending");

    const populated = await products.findById(product._id).populate("createdBy", "fname email");
    res.status(201).json(resolveProductCategory(populated.toObject()));
  } catch (error) {
    console.error("[Admin] Failed to create product:", error.message);
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/admin/products/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    const product = await products.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const payload = buildProductPayload(req.body, product);
    Object.assign(product, payload);
    await product.save();

    clearCache("/api/getproducts");
    clearCache("/api/products/trending");

    const populated = await products.findById(product._id).populate("createdBy", "fname email");
    res.status(200).json(resolveProductCategory(populated.toObject()));
  } catch (error) {
    console.error("[Admin] Failed to update product:", error.message);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/admin/products/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    const product = await products.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await products.deleteOne({ _id: product._id });

    clearCache("/api/getproducts");
    clearCache("/api/products/trending");

    res.status(200).json({ success: true, deletedProductId: product._id });
  } catch (error) {
    console.error("[Admin] Failed to delete product:", error.message);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// ─── Users Management ────────────────────────────────────────────────────────

// Users management
router.get("/admin/users", authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");
      query.$or = [
        { fname: searchRegex },
        { email: searchRegex },
        { mobile: searchRegex },
      ];
    }

    const [users, totalItems] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    const publicUsers = users.map((user) => ({
      _id: user._id,
      fname: user.fname,
      email: user.email,
      mobile: user.mobile,
      role: user.role || "user",
      cartsCount: Array.isArray(user.carts) ? user.carts.length : 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isBanned: user.isBanned || false,
      banReason: user.banReason || "",
      bannedAt: user.bannedAt || null,
    }));

    res.status(200).json({
      data: publicUsers,
      page: pageNum,
      limit: limitNum,
      total: totalItems,
      total_pages: Math.ceil(totalItems / limitNum),
    });
  } catch (error) {
    console.error("[Admin] Failed to fetch users:", error.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = router;
