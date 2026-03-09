const Category = require("../models/categorySchema");
const products = require("../models/productsSchema");
const { normalizeCategory, escapeRegex } = require("../utils/helpers");
const { CATEGORY_ALL, UNCATEGORIZED } = require("../utils/constants");

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

exports.getCategories = async (req, res) => {
    try {
        const pageNum = parseInt(req.query.page) || 1;
        const limitNum = parseInt(req.query.limit) || 50;
        const skip = (pageNum - 1) * limitNum;

        const [categoryDocs, totalItems] = await Promise.all([
            Category.find({}, { name: 1, image: 1, _id: 1 }).sort({ name: 1 }).skip(skip).limit(limitNum).lean(),
            Category.countDocuments({})
        ]);

        const result = {
            data: pageNum === 1 ? [{ _id: 'all', name: CATEGORY_ALL, image: "" }, ...categoryDocs] : categoryDocs,
            page: pageNum,
            limit: limitNum,
            total: totalItems + (pageNum === 1 ? 1 : 0),
            total_pages: Math.ceil((totalItems + (pageNum === 1 ? 1 : 0)) / limitNum)
        };
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};

exports.getDashboardCategories = async (req, res) => {
    try {
        const payload = await getCategoryDashboardPayload();
        res.status(200).json(payload);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch dashboard categories" });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, image } = req.body;
        const categoryName = typeof name === "string" ? name.trim() : "";
        const normalizedName = normalizeCategory(categoryName);

        if (!categoryName || categoryName.length < 2) {
            return res.status(422).json({ error: "Category name must be at least 2 characters" });
        }

        if (normalizedName === normalizeCategory(CATEGORY_ALL)) {
            return res.status(400).json({ error: `"${CATEGORY_ALL}" is a reserved label` });
        }

        const existingCategory = await Category.findOne({ normalizedName });
        if (existingCategory) return res.status(409).json({ error: "Category already exists" });

        const createdCategory = await Category.create({ name: categoryName, image: image?.trim() });
        res.status(201).json(createdCategory);
    } catch (error) {
        res.status(500).json({ error: "Failed to create category" });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image } = req.body;
        const category = await Category.findById(id);
        if (!category) return res.status(404).json({ error: "Category not found" });

        if (normalizeCategory(category.name) === normalizeCategory(UNCATEGORIZED)) {
            return res.status(400).json({ error: `Cannot rename "${UNCATEGORIZED}" category` });
        }

        const nextName = typeof name === "string" ? name.trim() : "";
        const normalizedName = normalizeCategory(nextName);

        if (!nextName || nextName.length < 2) return res.status(422).json({ error: "Category name must be at least 2 characters" });
        if (normalizedName === normalizeCategory(CATEGORY_ALL)) return res.status(400).json({ error: `"${CATEGORY_ALL}" is a reserved label` });

        const duplicate = await Category.findOne({ normalizedName, _id: { $ne: category._id } });
        if (duplicate) return res.status(409).json({ error: "Category already exists" });

        if (normalizedName !== normalizeCategory(category.name)) {
            await products.updateMany(
                { category: { $regex: `^${escapeRegex(category.name)}$`, $options: "i" } },
                { $set: { category: nextName } }
            );
        }

        category.name = nextName;
        if (typeof image === "string") category.image = image.trim();
        await category.save();

        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ error: "Failed to update category" });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
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
    } catch (error) {
        res.status(500).json({ error: "Failed to delete category" });
    }
};
