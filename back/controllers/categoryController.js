const Category = require("../models/categorySchema");
const products = require("../models/productsSchema");
const mongoose = require("mongoose");
const { normalizeCategory, escapeRegex } = require("../utils/helpers");
const { CATEGORY_ALL, UNCATEGORIZED } = require("../utils/constants");
const { asyncHandler } = require("../middleware/errorMiddleware");

// Re-using dashboard logic from helpers if needed, but keeping it concise here
const getCategoryDashboardPayload = async (categories = null) => {
    const [categoryDocs, productsData] = await Promise.all([
        categories || Category.find().sort({ name: 1 }).lean(),
        products.find({}, { category: 1 }).lean(),
    ]);

    const productCountByCategory = productsData.reduce((acc, product) => {
        const categoryName = product.category || UNCATEGORIZED;
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

exports.getCategories = asyncHandler(async (req, res) => {
    const pageNum = Math.max(1, parseInt(req.query.page) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [categoryDocs, totalItems] = await Promise.all([
        Category.find({}, { name: 1, image: 1, _id: 1 }).sort({ name: 1 }).skip(skip).limit(limitNum).lean(),
        Category.countDocuments({}),
    ]);

    const result = {
        data: pageNum === 1 ? [{ _id: "all", name: CATEGORY_ALL, image: "" }, ...categoryDocs] : categoryDocs,
        page: pageNum,
        limit: limitNum,
        total: totalItems + (pageNum === 1 ? 1 : 0),
        total_pages: Math.ceil((totalItems + (pageNum === 1 ? 1 : 0)) / limitNum),
    };
    res.status(200).json(result);
});

exports.getDashboardCategories = asyncHandler(async (req, res) => {
    const payload = await getCategoryDashboardPayload();
    res.status(200).json(payload);
});

exports.createCategory = asyncHandler(async (req, res) => {
    const { name, image } = req.body;
    const categoryName = typeof name === "string" ? name.trim() : "";
    const normalizedName = normalizeCategory(categoryName);

    if (!categoryName || categoryName.length < 2) {
        return res.status(422).json({ error: "Category name must be at least 2 characters" });
    }

    if (categoryName.length > 100) {
        return res.status(422).json({ error: "Category name must be at most 100 characters" });
    }

    if (normalizedName === normalizeCategory(CATEGORY_ALL)) {
        return res.status(400).json({ error: `"${CATEGORY_ALL}" is a reserved label` });
    }

    // Validate image URL if provided
    if (image && typeof image === "string" && image.trim().length > 0) {
        if (image.trim().length > 2048) {
            return res.status(422).json({ error: "Image URL too long" });
        }
    }

    const existingCategory = await Category.findOne({ normalizedName });
    if (existingCategory) return res.status(409).json({ error: "Category already exists" });

    const createdCategory = await Category.create({
        name: categoryName,
        image: image ? image.trim().substring(0, 2048) : "",
    });
    res.status(201).json(createdCategory);
});

exports.updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid category ID" });
    }

    const { name, image } = req.body;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    if (normalizeCategory(category.name) === normalizeCategory(UNCATEGORIZED)) {
        return res.status(400).json({ error: `Cannot rename "${UNCATEGORIZED}" category` });
    }

    const nextName = typeof name === "string" ? name.trim() : "";
    const normalizedName = normalizeCategory(nextName);

    if (!nextName || nextName.length < 2) {
        return res.status(422).json({ error: "Category name must be at least 2 characters" });
    }
    if (nextName.length > 100) {
        return res.status(422).json({ error: "Category name must be at most 100 characters" });
    }
    if (normalizedName === normalizeCategory(CATEGORY_ALL)) {
        return res.status(400).json({ error: `"${CATEGORY_ALL}" is a reserved label` });
    }

    const duplicate = await Category.findOne({ normalizedName, _id: { $ne: category._id } });
    if (duplicate) return res.status(409).json({ error: "Category already exists" });

    if (normalizedName !== normalizeCategory(category.name)) {
        await products.updateMany(
            { category: { $regex: `^${escapeRegex(category.name)}$`, $options: "i" } },
            { $set: { category: nextName } }
        );
    }

    category.name = nextName;
    if (typeof image === "string") category.image = image.trim().substring(0, 2048);
    await category.save();

    res.status(200).json(category);
});

exports.deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid category ID" });
    }

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    if (normalizeCategory(category.name) === normalizeCategory(UNCATEGORIZED)) {
        return res.status(400).json({ error: `Cannot delete "${UNCATEGORIZED}" category` });
    }

    let uncategorizedCategory = await Category.findOne({ normalizedName: normalizeCategory(UNCATEGORIZED) });
    if (!uncategorizedCategory) uncategorizedCategory = await Category.create({ name: UNCATEGORIZED });

    await products.updateMany(
        { category: { $regex: `^${escapeRegex(category.name)}$`, $options: "i" } },
        { $set: { category: uncategorizedCategory.name } }
    );

    await Category.findByIdAndDelete(category._id);
    res.status(200).json({ success: true, deletedCategoryId: category._id });
});
