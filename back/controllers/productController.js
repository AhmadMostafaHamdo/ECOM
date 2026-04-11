const products = require("../models/productsSchema");
const Category = require("../models/categorySchema");
const ProductView = require("../models/productViewSchema");
const {
    resolveProductCategory,
    toPublicProduct,
    buildProductPayload,
    generateProductId,
    getViewerIdentity,
    escapeRegex,
    buildTextFilterClause,
    normalizeCategory
} = require("../utils/helpers");
const { CATEGORY_ALL, TEXT_FILTER_FIELDS, UNCATEGORIZED } = require("../utils/constants");
const { asyncHandler } = require("../middleware/errorMiddleware");
const { clearCache } = require("../middleware/cacheMiddleware");

// Category sync logic - run once at startup or when explicitly needed
exports.ensureCategoryCatalog = async () => {
    try {
        const productsData = await products.find({}, { category: 1, title: 1 }).lean();
        if (!productsData.length) return;

        const backfillOperations = [];
        const hasSpecificCategory = productsData.some((product) => {
            const categoryValue = typeof product.category === "string" ? product.category.trim() : "";
            return categoryValue && normalizeCategory(categoryValue) !== normalizeCategory(UNCATEGORIZED);
        });

        const resolvedCategories = productsData.map((product) => {
            const currentCategory = typeof product.category === "string" ? product.category.trim() : "";
            const shortTitleValue = typeof product?.title?.shortTitle === "string" ? product.title.shortTitle.trim() : "";
            const shouldInitializeFromTitle = !hasSpecificCategory && normalizeCategory(currentCategory) === normalizeCategory(UNCATEGORIZED) && Boolean(shortTitleValue);

            const resolvedCategory = shouldInitializeFromTitle ? shortTitleValue : currentCategory || shortTitleValue || UNCATEGORIZED;

            if ((!currentCategory || shouldInitializeFromTitle) && resolvedCategory !== UNCATEGORIZED) {
                backfillOperations.push({
                    updateOne: {
                        filter: { _id: product._id },
                        update: { $set: { category: resolvedCategory } },
                    },
                });
            }
            return resolvedCategory;
        });

        if (backfillOperations.length) await products.bulkWrite(backfillOperations);

        const categoryNames = [...new Set(resolvedCategories.filter(Boolean))];
        if (!categoryNames.includes(UNCATEGORIZED)) categoryNames.push(UNCATEGORIZED);

        const existingCategories = await Category.find({}, { normalizedName: 1 }).lean();
        const existingNormalized = new Set(existingCategories.map((category) => category.normalizedName));
        const missingCategoryNames = categoryNames.filter((name) => !existingNormalized.has(normalizeCategory(name)));

        if (missingCategoryNames.length) {
            await Category.insertMany(missingCategoryNames.map((name) => ({ name })), { ordered: false });
        }
    } catch (e) {
        console.error("Error in ensureCategoryCatalog:", e);
    }
};

/**
 * @desc    Get all products with filtering and pagination
 * @route   GET /api/products
 */
exports.getProducts = asyncHandler(async (req, res) => {
    const { category, search, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (category && normalizeCategory(category) !== normalizeCategory(CATEGORY_ALL)) {
        query.category = { $regex: `^${escapeRegex(category)}$`, $options: "i" };
    }

    if (search) {
        const searchRegex = new RegExp(escapeRegex(search), "i");
        query.$or = [
            { "title.shortTitle": searchRegex },
            { "title.longTitle": searchRegex },
            { description: searchRegex },
            { tagline: searchRegex },
        ];
    }

    const [productsData, totalItems] = await Promise.all([
        products.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 }).lean(),
        products.countDocuments(query),
    ]);

    res.status(200).json({
        data: productsData.map(resolveProductCategory),
        page: pageNum,
        limit: limitNum,
        total: totalItems,
        total_pages: Math.ceil(totalItems / limitNum),
    });
});

/**
 * @desc    Get filtered products (POST for complex filters)
 * @route   POST /api/products/filter
 */
exports.filterProducts = asyncHandler(async (req, res) => {
    const { category, selections = {}, price, search, page = 1, limit = 12 } = req.method === 'POST' ? req.body : req.query;

    let activeSelections = selections;
    if (req.method === 'GET' && typeof selections === 'string') {
        try { activeSelections = JSON.parse(selections); } catch { activeSelections = {}; }
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    const clauses = [];
    if (category && normalizeCategory(category) !== normalizeCategory(CATEGORY_ALL)) {
        clauses.push({ category: { $regex: `^${escapeRegex(category)}$`, $options: "i" } });
    }

    if (search) {
        const searchRegex = new RegExp(escapeRegex(search), "i");
        clauses.push({
            $or: [
                { "title.shortTitle": searchRegex },
                { "title.longTitle": searchRegex },
                { description: searchRegex },
                { tagline: searchRegex },
            ],
        });
    }

    Object.entries(activeSelections).forEach(([filterId, values]) => {
        if (!Array.isArray(values) || !values.length) return;
        const clause = buildTextFilterClause(values, TEXT_FILTER_FIELDS[filterId] || ["title.shortTitle", "title.longTitle", "description", "tagline"]);
        if (clause) clauses.push(clause);
    });

    const numericPrice = Number(price);
    if (price && Number.isFinite(numericPrice)) {
        clauses.push({ "price.cost": { $lte: numericPrice } });
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
});

/**
 * @desc    Get product by ID and track view
 * @route   GET /api/products/:id
 */
exports.getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await products.findOne({ id }).populate("createdBy", "fname email _id");
    if (!product) return res.status(404).json({ error: "Product not found" });

    const viewer = getViewerIdentity(req, res);
    const viewRecordQuery = { productId: id };

    if (viewer.userId) viewRecordQuery.userId = viewer.userId;
    else if (viewer.sessionId) viewRecordQuery.sessionId = viewer.sessionId;
    else viewRecordQuery.ipHash = viewer.ipHash;

    const alreadyViewed = await ProductView.findOne(viewRecordQuery);
    if (!alreadyViewed) {
        try {
            await ProductView.create({
                productId: id,
                userId: viewer.userId || undefined,
                sessionId: viewer.sessionId || undefined,
                ipHash: viewer.ipHash || undefined,
                userAgent: viewer.userAgent,
            });
        } catch (viewError) {
            if (viewError?.code !== 11000) console.log("view tracking error:", viewError.message);
        }
    }

    const uniqueViews = await ProductView.countDocuments({ productId: id });
    if (product.views !== uniqueViews) {
        product.views = uniqueViews;
        await product.save();
    }

    res.status(200).json(toPublicProduct(product));
});

/**
 * @desc    Create a new product
 * @route   POST /api/products
 */
exports.createProduct = asyncHandler(async (req, res) => {
    const payload = buildProductPayload(req.body);

    if (!payload?.title?.shortTitle || !payload?.title?.longTitle) {
        return res.status(422).json({ error: "Product title is required" });
    }

    const product = await products.create({
        id: req.body?.id ? req.body.id.toString().trim() : generateProductId(),
        ...payload,
        createdBy: req.userID,
    });

    // Clear product-related caches
    clearCache("/api/getproducts");
    clearCache("/api/products/trending");

    const populated = await products.findById(product._id).populate("createdBy", "fname email");
    res.status(201).json(toPublicProduct(populated));
});

/**
 * @desc    Update a product
 * @route   PATCH /api/products/:id
 */
exports.updateProduct = asyncHandler(async (req, res) => {
    const product = await products.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const canModify = req.rootUser.role === "admin" || (product.createdBy && product.createdBy.toString() === req.userID.toString());
    if (!canModify) return res.status(403).json({ error: "Not allowed to update this product" });

    const payload = buildProductPayload(req.body, product);
    Object.assign(product, payload);
    await product.save();

    // Clear caches
    clearCache("/api/getproducts");
    clearCache(`/api/getproductsone/${req.params.id}`);
    clearCache("/api/products/trending");

    const populated = await products.findById(product._id).populate("createdBy", "fname email");
    res.status(200).json(toPublicProduct(populated));
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
    const product = await products.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const canModify = req.rootUser.role === "admin" || (product.createdBy && product.createdBy.toString() === req.userID.toString());
    if (!canModify) return res.status(403).json({ error: "Not allowed to delete this product" });

    await products.deleteOne({ _id: product._id });
    await ProductView.deleteMany({ productId: product.id });

    // Clear caches
    clearCache("/api/getproducts");
    clearCache(`/api/getproductsone/${req.params.id}`);
    clearCache("/api/products/trending");

    res.status(200).json({ success: true, deletedProductId: product.id });
});

/**
 * @desc    Get trending products
 * @route   GET /api/products/trending
 */
exports.getTrendingProducts = asyncHandler(async (req, res) => {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const trending = await products.find().sort({ views: -1, createdAt: -1 }).limit(limit);
    res.status(200).json(trending.map(resolveProductCategory));
});
