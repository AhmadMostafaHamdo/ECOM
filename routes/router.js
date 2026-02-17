const express = require("express");
const router = new express.Router();
const products = require("../models/productsSchema");
const Category = require("../models/categorySchema");
const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const authenicate = require("../middleware/authenticate");

const CATEGORY_ALL = "All Categories";
const UNCATEGORIZED = "Uncategorized";
const USER_ROLES = new Set(["user", "admin"]);
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

const normalizeCategory = (value = "") => value.toString().trim().toLowerCase();

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const generateProductId = () => `product_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

const TEXT_FILTER_FIELDS = {
    brand: ["title.shortTitle", "title.longTitle", "description", "tagline"],
    color: ["description", "tagline"],
    material: ["description", "tagline"],
    type: ["description", "tagline"],
    style: ["description", "tagline"],
    fit: ["description", "tagline"],
    gender: ["description", "tagline"],
    size: ["description", "tagline"],
    availability: ["description", "tagline"],
    rating: ["description", "tagline"]
};

const buildTextFilterClause = (values = [], fields = ["title.shortTitle", "title.longTitle", "description", "tagline"]) => {
    const clauses = [];
    values.forEach((value) => {
        const normalized = typeof value === "string" ? value.trim() : "";
        if (!normalized) {
            return;
        }

        const regex = new RegExp(escapeRegex(normalized), "i");
        fields.forEach((field) => {
            clauses.push({ [field]: { $regex: regex } });
        });
    });
    return clauses.length ? { $or: clauses } : null;
};

const resolveProductCategory = (productDoc) => {
    const product = productDoc.toObject ? productDoc.toObject() : productDoc;
    const categoryValue = typeof product.category === "string" ? product.category.trim() : "";
    const shortTitleValue = typeof product?.title?.shortTitle === "string" ? product.title.shortTitle.trim() : "";

    return {
        ...product,
        category: categoryValue || shortTitleValue || UNCATEGORIZED
    };
};

const toSessionUser = (userDoc) => {
    const user = userDoc.toObject ? userDoc.toObject() : userDoc;

    return {
        _id: user._id,
        fname: user.fname,
        email: user.email,
        mobile: user.mobile,
        role: user.role || "user",
        carts: Array.isArray(user.carts) ? user.carts : [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};

const requireAdmin = async (req, res, next) => {
    try {
        if (req.rootUser?.role === "admin") {
            return next();
        }

        // Bootstrap path: if no admin exists, promote the current authenticated user.
        const adminsCount = await User.countDocuments({ role: "admin" });
        if (!adminsCount && req.rootUser) {
            req.rootUser.role = "admin";
            await req.rootUser.save();
            return next();
        }

        return res.status(403).json({ error: "Admin access required" });
    } catch (error) {
        console.log("error " + error.message);
        return res.status(500).json({ error: "Failed to verify admin access" });
    }
};

const parseImages = (input) => {
    if (Array.isArray(input)) {
        return input.map((item) => item?.toString().trim()).filter(Boolean);
    }

    if (typeof input === "string") {
        return input
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

const buildProductPayload = (body = {}, fallback = {}) => {
    const shortTitle = (body.shortTitle || fallback?.title?.shortTitle || "").toString().trim();
    const longTitle = (body.longTitle || fallback?.title?.longTitle || "").toString().trim();
    const category = (body.category || fallback.category || UNCATEGORIZED).toString().trim();

    const cost = Number(body.cost ?? fallback?.price?.cost ?? 0);
    const mrp = Number(body.mrp ?? fallback?.price?.mrp ?? cost);
    const priceDiscount = (body.priceDiscount || fallback?.price?.discount || "").toString().trim();

    const images = parseImages(body.images);
    const primaryImage = (body.url || fallback.url || images[0] || "").toString().trim();
    const detailImage = (body.detailUrl || fallback.detailUrl || images[1] || primaryImage || "").toString().trim();

    return {
        category: category || UNCATEGORIZED,
        url: primaryImage,
        detailUrl: detailImage,
        images: images.length ? images : [primaryImage, detailImage].filter(Boolean),
        title: {
            shortTitle: shortTitle || longTitle || "Untitled Product",
            longTitle: longTitle || shortTitle || "Untitled Product"
        },
        price: {
            mrp: Number.isFinite(mrp) ? mrp : 0,
            cost: Number.isFinite(cost) ? cost : 0,
            discount: priceDiscount || (Number.isFinite(mrp) && mrp > 0 && Number.isFinite(cost)
                ? `${Math.max(0, Math.round(((mrp - cost) / mrp) * 100))}%`
                : "0%")
        },
        description: (body.description || fallback.description || "").toString().trim(),
        discount: (body.offerText || body.discount || fallback.discount || "").toString().trim(),
        tagline: (body.tagline || fallback.tagline || "").toString().trim()
    };
};

const ensureCategoryCatalog = async () => {
    const productsData = await products.find({}, { category: 1, title: 1 });
    const backfillOperations = [];
    const hasSpecificCategory = productsData.some((product) => {
        const categoryValue = typeof product.category === "string" ? product.category.trim() : "";
        return categoryValue && normalizeCategory(categoryValue) !== normalizeCategory(UNCATEGORIZED);
    });

    const resolvedCategories = productsData.map((product) => {
        const currentCategory = typeof product.category === "string" ? product.category.trim() : "";
        const shortTitleValue = typeof product?.title?.shortTitle === "string" ? product.title.shortTitle.trim() : "";
        const shouldInitializeFromTitle =
            !hasSpecificCategory &&
            normalizeCategory(currentCategory) === normalizeCategory(UNCATEGORIZED) &&
            Boolean(shortTitleValue);

        const resolvedCategory = shouldInitializeFromTitle
            ? shortTitleValue
            : currentCategory || shortTitleValue || UNCATEGORIZED;

        if ((!currentCategory || shouldInitializeFromTitle) && resolvedCategory !== UNCATEGORIZED) {
            backfillOperations.push({
                updateOne: {
                    filter: { _id: product._id },
                    update: { $set: { category: resolvedCategory } }
                }
            });
        }

        return resolvedCategory;
    });

    if (backfillOperations.length) {
        await products.bulkWrite(backfillOperations);
    }

    const categoryNames = [
        ...new Set(
            resolvedCategories.filter(Boolean)
        )
    ];

    if (!categoryNames.includes(UNCATEGORIZED)) {
        categoryNames.push(UNCATEGORIZED);
    }

    if (!categoryNames.length) {
        categoryNames.push(UNCATEGORIZED);
    }

    const existingCategories = await Category.find({}, { normalizedName: 1 });
    const existingNormalized = new Set(existingCategories.map((category) => category.normalizedName));
    const missingCategoryNames = categoryNames.filter(
        (name) => !existingNormalized.has(normalizeCategory(name))
    );

    if (missingCategoryNames.length) {
        await Category.insertMany(missingCategoryNames.map((name) => ({ name })), { ordered: false });
    }
};

const toPublicUser = (userDoc) => {
    const user = userDoc.toObject ? userDoc.toObject() : userDoc;
    return {
        _id: user._id,
        fname: user.fname,
        email: user.email,
        mobile: user.mobile,
        role: user.role || "user",
        cartsCount: Array.isArray(user.carts) ? user.carts.length : 0,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};

const toPublicProduct = (productDoc) => {
    const product = productDoc.toObject ? productDoc.toObject() : productDoc;

    return {
        ...resolveProductCategory(product),
        createdBy: product?.createdBy && typeof product.createdBy === "object"
            ? {
                _id: product.createdBy._id,
                fname: product.createdBy.fname,
                email: product.createdBy.email
            }
            : product.createdBy || null
    };
};

const getCategoryDashboardPayload = async () => {
    await ensureCategoryCatalog();

    const [categoryDocs, productsData] = await Promise.all([
        Category.find().sort({ name: 1 }),
        products.find({}, { category: 1, title: 1 })
    ]);

    const productCountByCategory = productsData.reduce((acc, product) => {
        const categoryName = resolveProductCategory(product).category;
        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
    }, {});

    return categoryDocs.map((categoryDoc) => ({
        _id: categoryDoc._id,
        name: categoryDoc.name,
        productCount: productCountByCategory[categoryDoc.name] || 0
    }));
};

const createCategoryRecord = async (rawName = "") => {
    await ensureCategoryCatalog();

    const categoryName = typeof rawName === "string" ? rawName.trim() : "";
    const normalizedName = normalizeCategory(categoryName);

    if (!categoryName || categoryName.length < 2) {
        return { status: 422, body: { error: "Category name must be at least 2 characters" } };
    }

    if (normalizedName === normalizeCategory(CATEGORY_ALL)) {
        return { status: 400, body: { error: `"${CATEGORY_ALL}" is a reserved label` } };
    }

    const existingCategory = await Category.findOne({ normalizedName });
    if (existingCategory) {
        return { status: 409, body: { error: "Category already exists" } };
    }

    const createdCategory = await Category.create({ name: categoryName });
    return { status: 201, body: createdCategory };
};

const updateCategoryRecord = async (categoryId, rawName = "") => {
    await ensureCategoryCatalog();

    const category = await Category.findById(categoryId);
    if (!category) {
        return { status: 404, body: { error: "Category not found" } };
    }

    if (normalizeCategory(category.name) === normalizeCategory(UNCATEGORIZED)) {
        return { status: 400, body: { error: `Cannot rename "${UNCATEGORIZED}" category` } };
    }

    const nextName = typeof rawName === "string" ? rawName.trim() : "";
    const normalizedName = normalizeCategory(nextName);

    if (!nextName || nextName.length < 2) {
        return { status: 422, body: { error: "Category name must be at least 2 characters" } };
    }

    if (normalizedName === normalizeCategory(CATEGORY_ALL)) {
        return { status: 400, body: { error: `"${CATEGORY_ALL}" is a reserved label` } };
    }

    if (normalizedName === normalizeCategory(category.name)) {
        return { status: 200, body: { category, renamedProducts: 0 } };
    }

    const duplicate = await Category.findOne({ normalizedName, _id: { $ne: category._id } });
    if (duplicate) {
        return { status: 409, body: { error: "Category already exists" } };
    }

    const renameResult = await products.updateMany(
        { category: { $regex: `^${escapeRegex(category.name)}$`, $options: "i" } },
        { $set: { category: nextName } }
    );

    category.name = nextName;
    await category.save();

    return {
        status: 200,
        body: {
            category,
            renamedProducts: renameResult.modifiedCount || 0
        }
    };
};

const deleteCategoryRecord = async (categoryId) => {
    await ensureCategoryCatalog();

    const category = await Category.findById(categoryId);
    if (!category) {
        return { status: 404, body: { error: "Category not found" } };
    }

    if (normalizeCategory(category.name) === normalizeCategory(UNCATEGORIZED)) {
        return { status: 400, body: { error: `Cannot delete "${UNCATEGORIZED}" category` } };
    }

    let uncategorizedCategory = await Category.findOne({ normalizedName: normalizeCategory(UNCATEGORIZED) });
    if (!uncategorizedCategory) {
        uncategorizedCategory = await Category.create({ name: UNCATEGORIZED });
    }

    const movedProductsResult = await products.updateMany(
        { category: { $regex: `^${escapeRegex(category.name)}$`, $options: "i" } },
        { $set: { category: uncategorizedCategory.name } }
    );

    await Category.findByIdAndDelete(category._id);

    return {
        status: 200,
        body: {
            success: true,
            deletedCategoryId: category._id,
            movedProducts: movedProductsResult.modifiedCount || 0
        }
    };
};

// router.get("/",(req,res)=>{
//     res.send("this is testing routes");
// });


// get the products data

router.get("/getproducts", async (req, res) => {
    try {
        await ensureCategoryCatalog();

        const { category } = req.query;
        const normalizedFilter = normalizeCategory(category);
        const productsData = await products.find();
        const productsWithCategory = productsData.map(resolveProductCategory);

        const filteredProducts = !normalizedFilter || normalizedFilter === normalizeCategory(CATEGORY_ALL)
            ? productsWithCategory
            : productsWithCategory.filter(
                (product) => normalizeCategory(product.category) === normalizedFilter
            );

        res.status(201).json(filteredProducts);
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

router.post("/products/filter", async (req, res) => {
    try {
        await ensureCategoryCatalog();

        const { category, selections = {}, price } = req.body || {};
        const normalizedSelections = Object.entries(selections).reduce((acc, [filterId, values]) => {
            if (Array.isArray(values) && values.length) {
                acc[filterId] = values;
            }
            return acc;
        }, {});

        const clauses = [];

        if (category && category !== CATEGORY_ALL) {
            clauses.push({
                category: { $regex: `^${escapeRegex(category)}$`, $options: "i" }
            });
        }

        Object.entries(normalizedSelections).forEach(([filterId, values]) => {
            const clause = buildTextFilterClause(values, TEXT_FILTER_FIELDS[filterId] || ["title.shortTitle", "title.longTitle", "description", "tagline"]);
            if (clause) {
                clauses.push(clause);
            }
        });

        const numericPrice = Number(price);
        if (price && Number.isFinite(numericPrice)) {
            clauses.push({
                "price.cost": { $lte: numericPrice }
            });
        }

        const query = clauses.length ? { $and: clauses } : {};
        const productsData = await products.find(query);
        const productsWithCategory = productsData.map(resolveProductCategory);

        res.status(200).json(productsWithCategory);
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to fetch filtered products" });
    }
});

// GET fallback for environments or clients that issue GET requests
router.get("/products/filter", async (req, res) => {
    try {
        await ensureCategoryCatalog();

        const category = req.query.category;
        const price = req.query.price ? Number(req.query.price) : null;
        let selections = {};
        if (req.query.selections) {
            try {
                selections = JSON.parse(req.query.selections);
            } catch {
                selections = {};
            }
        }

        const normalizedSelections = Object.entries(selections).reduce((acc, [filterId, values]) => {
            if (Array.isArray(values) && values.length) {
                acc[filterId] = values;
            }
            return acc;
        }, {});

        const clauses = [];

        if (category && category !== CATEGORY_ALL) {
            clauses.push({
                category: { $regex: `^${escapeRegex(category)}$`, $options: "i" }
            });
        }

        Object.entries(normalizedSelections).forEach(([filterId, values]) => {
            const clause = buildTextFilterClause(values, TEXT_FILTER_FIELDS[filterId] || ["title.shortTitle", "title.longTitle", "description", "tagline"]);
            if (clause) {
                clauses.push(clause);
            }
        });

        if (price && Number.isFinite(price)) {
            clauses.push({
                "price.cost": { $lte: price }
            });
        }

        const query = clauses.length ? { $and: clauses } : {};
        const productsData = await products.find(query);
        const productsWithCategory = productsData.map(resolveProductCategory);

        res.status(200).json(productsWithCategory);
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to fetch filtered products" });
    }
});

router.get("/getcategories", async (req, res) => {
    try {
        await ensureCategoryCatalog();
        const categoryDocs = await Category.find({}, { name: 1, _id: 0 }).sort({ name: 1 });
        const categories = categoryDocs.map((item) => item.name);

        res.status(200).json([CATEGORY_ALL, ...categories]);
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

router.get("/categories", async (req, res) => {
    try {
        const payload = await getCategoryDashboardPayload();
        res.status(200).json(payload);
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to fetch dashboard categories" });
    }
});

router.post("/categories", async (req, res) => {
    try {
        const result = await createCategoryRecord(req.body?.name);
        return res.status(result.status).json(result.body);
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to create category" });
    }
});

router.put("/categories/:id", async (req, res) => {
    try {
        const result = await updateCategoryRecord(req.params.id, req.body?.name);
        return res.status(result.status).json(result.body);
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to update category" });
    }
});

router.delete("/categories/:id", async (req, res) => {
    try {
        const result = await deleteCategoryRecord(req.params.id);
        return res.status(result.status).json(result.body);
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to delete category" });
    }
});

router.get("/admin/categories", authenicate, requireAdmin, async (req, res) => {
    try {
        const payload = await getCategoryDashboardPayload();
        res.status(200).json(payload);
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to fetch admin categories" });
    }
});

router.post("/admin/categories", authenicate, requireAdmin, async (req, res) => {
    try {
        const result = await createCategoryRecord(req.body?.name);
        return res.status(result.status).json(result.body);
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to create admin category" });
    }
});

router.put("/admin/categories/:id", authenicate, requireAdmin, async (req, res) => {
    try {
        const result = await updateCategoryRecord(req.params.id, req.body?.name);
        return res.status(result.status).json(result.body);
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to update admin category" });
    }
});

router.delete("/admin/categories/:id", authenicate, requireAdmin, async (req, res) => {
    try {
        const result = await deleteCategoryRecord(req.params.id);
        return res.status(result.status).json(result.body);
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to delete admin category" });
    }
});

router.get("/admin/users", authenicate, requireAdmin, async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json(users.map(toPublicUser));
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

router.get("/admin/users/:id", authenicate, requireAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(toPublicUser(user));
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to fetch user details" });
    }
});

router.post("/admin/users", authenicate, requireAdmin, async (req, res) => {
    try {
        const { fname, email, mobile, password, cpassword, role } = req.body || {};

        if (!fname || !email || !mobile || !password) {
            return res.status(422).json({ error: "Name, email, mobile and password are required" });
        }

        const confirmPassword = cpassword || password;
        if (password !== confirmPassword) {
            return res.status(422).json({ error: "Passwords do not match" });
        }

        const safeRole = USER_ROLES.has(role) ? role : "user";

        const [existingEmail, existingMobile] = await Promise.all([
            User.findOne({ email: email.trim() }),
            User.findOne({ mobile: mobile.toString().trim() })
        ]);

        if (existingEmail) {
            return res.status(409).json({ error: "Email already exists" });
        }

        if (existingMobile) {
            return res.status(409).json({ error: "Mobile number already exists" });
        }

        const user = new User({
            fname: fname.trim(),
            email: email.trim(),
            mobile: mobile.toString().trim(),
            password,
            cpassword: confirmPassword,
            role: safeRole
        });

        const savedUser = await user.save();
        return res.status(201).json(toPublicUser(savedUser));
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ error: "Duplicate user field value" });
        }
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to create user" });
    }
});

router.put("/admin/users/:id", authenicate, requireAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const { fname, email, mobile, password, cpassword, role } = req.body || {};

        if (typeof fname === "string" && fname.trim()) {
            user.fname = fname.trim();
        }

        if (typeof email === "string" && email.trim()) {
            user.email = email.trim();
        }

        if (typeof mobile !== "undefined" && mobile !== null && mobile.toString().trim()) {
            user.mobile = mobile.toString().trim();
        }

        if (typeof role === "string" && USER_ROLES.has(role.trim().toLowerCase())) {
            user.role = role.trim().toLowerCase();
        }

        if (typeof password === "string" && password.trim()) {
            const nextPassword = password.trim();
            const confirmPassword = typeof cpassword === "string" && cpassword.trim()
                ? cpassword.trim()
                : nextPassword;

            if (nextPassword !== confirmPassword) {
                return res.status(422).json({ error: "Passwords do not match" });
            }

            user.password = nextPassword;
            user.cpassword = confirmPassword;
        }

        const updatedUser = await user.save();
        return res.status(200).json(toPublicUser(updatedUser));
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ error: "Email or mobile already exists" });
        }
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to update user" });
    }
});

router.delete("/admin/users/:id", authenicate, requireAdmin, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ success: true, deletedUserId: deletedUser._id });
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to delete user" });
    }
});

router.get("/admin/stats", authenicate, requireAdmin, async (req, res) => {
    try {
        await ensureCategoryCatalog();

        const [totalUsers, totalCategories, totalProducts, totalAdmins, totalCartItemsAgg] = await Promise.all([
            User.countDocuments(),
            Category.countDocuments(),
            products.countDocuments(),
            User.countDocuments({ role: "admin" }),
            User.aggregate([
                {
                    $project: {
                        cartCount: {
                            $size: {
                                $ifNull: ["$carts", []]
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$cartCount" }
                    }
                }
            ])
        ]);

        const totalCartItems = totalCartItemsAgg?.[0]?.total || 0;

        res.status(200).json({
            totalUsers,
            totalAdmins,
            totalCategories,
            totalProducts,
            totalCartItems
        });
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to fetch statistics" });
    }
});

router.get("/admin/products", authenicate, requireAdmin, async (req, res) => {
    try {
        const query = {};
        const normalizedCategory = normalizeCategory(req.query?.category);
        if (normalizedCategory && normalizedCategory !== normalizeCategory(CATEGORY_ALL)) {
            query.category = { $regex: `^${escapeRegex(req.query.category.trim())}$`, $options: "i" };
        }

        const productDocs = await products
            .find(query)
            .sort({ createdAt: -1 })
            .populate("createdBy", "fname email");

        res.status(200).json(productDocs.map(toPublicProduct));
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to fetch products for admin" });
    }
});

router.post("/admin/products", authenicate, requireAdmin, async (req, res) => {
    try {
        await ensureCategoryCatalog();
        const payload = buildProductPayload(req.body);

        const product = await products.create({
            id: req.body?.id ? req.body.id.toString().trim() : generateProductId(),
            ...payload,
            rating: Number(req.body?.rating) || 0,
            createdBy: req.body?.createdBy || req.userID || null
        });

        const populated = await products.findById(product._id).populate("createdBy", "fname email");
        res.status(201).json(toPublicProduct(populated));
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ error: "Product id already exists" });
        }
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to create admin product" });
    }
});

router.put("/admin/products/:id", authenicate, requireAdmin, async (req, res) => {
    try {
        const product = await products.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const payload = buildProductPayload(req.body, product);
        Object.assign(product, payload);
        if (typeof req.body?.rating !== "undefined") {
            product.rating = Number(req.body.rating) || 0;
        }
        await product.save();

        const populated = await products.findById(product._id).populate("createdBy", "fname email");
        res.status(200).json(toPublicProduct(populated));
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to update admin product" });
    }
});

router.delete("/admin/products/:id", authenicate, requireAdmin, async (req, res) => {
    try {
        const product = await products.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json({ success: true, deletedProductId: product._id });
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to delete admin product" });
    }
});

router.get("/profile", authenicate, async (req, res) => {
    try {
        res.status(200).json(toSessionUser(req.rootUser));
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

router.put("/profile", authenicate, async (req, res) => {
    try {
        const { fname, email, mobile } = req.body || {};
        const user = req.rootUser;

        if (typeof fname === "string" && fname.trim()) {
            user.fname = fname.trim();
        }

        if (typeof email === "string" && email.trim()) {
            user.email = email.trim();
        }

        if (typeof mobile !== "undefined" && mobile !== null && mobile.toString().trim()) {
            user.mobile = mobile.toString().trim();
        }

        const updatedUser = await user.save();
        res.status(200).json(toSessionUser(updatedUser));
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ error: "Email or mobile already exists" });
        }
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to update profile" });
    }
});

router.get("/profile/products", authenicate, async (req, res) => {
    try {
        const productDocs = await products.find({ createdBy: req.userID }).sort({ createdAt: -1 });
        res.status(200).json(productDocs.map(toPublicProduct));
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to fetch profile products" });
    }
});

router.post("/products", authenicate, async (req, res) => {
    try {
        await ensureCategoryCatalog();
        const payload = buildProductPayload(req.body);

        if (!payload?.title?.shortTitle || !payload?.title?.longTitle) {
            return res.status(422).json({ error: "Product title is required" });
        }

        const product = await products.create({
            id: req.body?.id ? req.body.id.toString().trim() : generateProductId(),
            ...payload,
            createdBy: req.userID
        });

        const populated = await products.findById(product._id).populate("createdBy", "fname email");
        res.status(201).json(toPublicProduct(populated));
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ error: "Product id already exists" });
        }
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to create product" });
    }
});

router.get("/products/mine", authenicate, async (req, res) => {
    try {
        const productDocs = await products.find({ createdBy: req.userID }).sort({ createdAt: -1 });
        res.status(200).json(productDocs.map(toPublicProduct));
    } catch (error) {
        console.log("error " + error.message);
        res.status(500).json({ error: "Failed to fetch your products" });
    }
});


// register the data
router.post("/register", async (req, res) => {
    // console.log(req.body);
    const { fname, email, mobile, password, cpassword } = req.body;

    if (!fname || !email || !mobile || !password || !cpassword) {
        return res.status(422).json({ error: "fill the all details" });
        console.log("bhai nathi present badhi details");
    };

    try {

        const preuser = await User.findOne({ email: email });
        const premobile = await User.findOne({ mobile: mobile });

        if (preuser) {
            return res.status(422).json({ error: "This email already exists" });
        } else if (premobile) {
            return res.status(422).json({ error: "This mobile already exists" });
        } else if (password !== cpassword) {
            return res.status(422).json({ error: "passwords are not matching" });
        } else {
            const totalUsers = await User.countDocuments();

            const finaluser = new User({
                fname,
                email,
                mobile,
                password,
                cpassword,
                role: totalUsers === 0 ? "admin" : "user"
            });

            const storedata = await finaluser.save();
            const token = await storedata.generatAuthtoken();

            res.cookie("eccomerce", token, {
                expires: new Date(Date.now() + ONE_YEAR_MS),
                maxAge: ONE_YEAR_MS,
                httpOnly: true,
                sameSite: "lax",
                secure: false
            });
            return res.status(201).json(toSessionUser(storedata));
        }

    } catch (error) {
        console.log("error the bhai catch ma for registratoin time" + error.message);
        if (error?.code === 11000) {
            return res.status(409).json({ error: "Email or mobile already exists" });
        }
        res.status(422).json({ error: "Registration failed" });
    }

});



// login data
router.post("/login", async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "fill the details" });
    }

    try {

        const userlogin = await User.findOne({ email: email });
        console.log(userlogin);
        if (userlogin) {
            const isMatch = await bcrypt.compare(password, userlogin.password);
            console.log(isMatch);



            if (!isMatch) {
                res.status(400).json({ error: "invalid crediential pass" });
            } else {

                const token = await userlogin.generatAuthtoken();
                console.log(token);

                res.cookie("eccomerce", token, {
                    expires: new Date(Date.now() + ONE_YEAR_MS),
                    maxAge: ONE_YEAR_MS,
                    httpOnly: true,
                    sameSite: "lax",
                    secure: false
                });
                res.status(201).json(toSessionUser(userlogin));
            }

        } else {
            res.status(400).json({ error: "user not exist" });
        }

    } catch (error) {
        res.status(400).json({ error: "invalid crediential pass" });
        console.log("error the bhai catch ma for login time" + error.message);
    }
});

// getindividual

router.get("/getproductsone/:id", async (req, res) => {

    try {
        const { id } = req.params;
        console.log(id);

        const individual = await products.findOneAndUpdate(
            { id: id },
            { $inc: { views: 1 } },
            { new: true }
        );
        console.log(individual + "ind mila hai");

        res.status(201).json(individual);
    } catch (error) {
        res.status(400).json(error);
    }
});


// adding the data into cart
router.post("/addcart/:id", authenicate, async (req, res) => {

    try {
        console.log("perfect 6");
        const { id } = req.params;
        const cart = await products.findOne({ id: id });
        console.log(cart + "cart milta hain");

        const Usercontact = await User.findOne({ _id: req.userID });
        console.log(Usercontact + "user milta hain");


        if (Usercontact) {
            const cartData = await Usercontact.addcartdata(cart);

            await Usercontact.save();
            console.log(cartData + " thse save wait kr");
            console.log(Usercontact + "userjode save");
            res.status(201).json(toSessionUser(Usercontact));
        }
    } catch (error) {
        console.log(error);
    }
});


// get data into the cart
router.get("/cartdetails", authenicate, async (req, res) => {
    try {
        const buyuser = await User.findOne({ _id: req.userID });
        console.log(buyuser + "user hain buy pr");
        res.status(201).json(toSessionUser(buyuser));
    } catch (error) {
        console.log(error + "error for buy now");
    }
});



// get user is login or not
router.get("/validuser", authenicate, async (req, res) => {
    try {
        const validuserone = await User.findOne({ _id: req.userID });
        console.log(validuserone + "user hain home k header main pr");
        res.status(201).json(toSessionUser(validuserone));
    } catch (error) {
        console.log(error + "error for valid user");
    }
});

// for userlogout

router.get("/logout", authenicate, async (req, res) => {
    try {
        req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
            return curelem.token !== req.token
        });

        res.clearCookie("eccomerce", { path: "/" });
        req.rootUser.save();
        res.status(201).json({ success: true });
        console.log("user logout");

    } catch (error) {
        console.log(error + "jwt provide then logout");
    }
});

// item remove ho rhi hain lekin api delete use krna batter hoga
// remove iteam from the cart

router.get("/remove/:id", authenicate, async (req, res) => {
    try {
        const { id } = req.params;

        req.rootUser.carts = req.rootUser.carts.filter((curel) => {
            return curel.id != id
        });

        req.rootUser.save();
        res.status(201).json(toSessionUser(req.rootUser));
        console.log("iteam remove");

    } catch (error) {
        console.log(error + "jwt provide then remove");
        res.status(400).json(error);
    }
});


// ============================================
// REVIEW SYSTEM API ENDPOINTS
// ============================================

const Review = require("../models/reviewSchema");

// Helper function to update rating aggregation
const updateRatingAggregation = async (targetType, targetId) => {
    try {
        const reviews = await Review.find({
            targetType,
            targetId,
            status: "approved"
        });

        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;

        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
        });

        if (targetType === "product") {
            await products.findOneAndUpdate(
                { id: targetId },
                {
                    averageRating: Math.round(averageRating * 10) / 10,
                    totalReviews,
                    ratingDistribution
                }
            );
        } else if (targetType === "user") {
            await User.findByIdAndUpdate(
                targetId,
                {
                    averageRating: Math.round(averageRating * 10) / 10,
                    totalReviews
                }
            );
        }
    } catch (error) {
        console.log("Rating aggregation error:", error.message);
    }
};

// Create a review
router.post("/reviews", authenicate, async (req, res) => {
    try {
        const { targetType, targetId, rating, title, comment } = req.body;

        if (!targetType || !targetId || !rating || !comment) {
            return res.status(422).json({ error: "Missing required fields" });
        }

        if (!["product", "user"].includes(targetType)) {
            return res.status(400).json({ error: "Invalid target type" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }

        // Check if target exists
        if (targetType === "product") {
            const product = await products.findOne({ id: targetId });
            if (!product) {
                return res.status(404).json({ error: "Product not found" });
            }
        } else {
            const user = await User.findById(targetId);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
        }

        const review = await Review.create({
            targetType,
            targetId,
            reviewerId: req.userID,
            rating: Number(rating),
            title: title?.trim() || "",
            comment: comment.trim()
        });

        await updateRatingAggregation(targetType, targetId);

        const populated = await Review.findById(review._id)
            .populate("reviewerId", "fname email isVerified");

        res.status(201).json(populated);
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ error: "You have already reviewed this item" });
        }
        console.log("Review creation error:", error.message);
        res.status(500).json({ error: "Failed to create review" });
    }
});

// Get reviews for a target (product or user)
router.get("/reviews/:targetType/:targetId", async (req, res) => {
    try {
        const { targetType, targetId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = {
            targetType,
            targetId,
            status: "approved"
        };

        const [reviews, total] = await Promise.all([
            Review.find(query)
                .populate("reviewerId", "fname email isVerified")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Review.countDocuments(query)
        ]);

        // Get rating summary
        const allReviews = await Review.find({ targetType, targetId, status: "approved" });
        const totalReviews = allReviews.length;
        const averageRating = totalReviews > 0
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;

        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        allReviews.forEach(r => {
            ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
        });

        res.status(200).json({
            reviews,
            summary: {
                totalReviews,
                averageRating: Math.round(averageRating * 10) / 10,
                ratingDistribution
            },
            pagination: {
                page,
                limit,
                total,
                hasMore: skip + reviews.length < total
            }
        });
    } catch (error) {
        console.log("Fetch reviews error:", error.message);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

// Vote helpful/unhelpful on a review
router.put("/reviews/:id/helpful", authenicate, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        const userId = req.userID.toString();
        const helpfulIndex = review.helpfulVoters.findIndex(
            id => id.toString() === userId
        );

        if (helpfulIndex > -1) {
            // Remove vote
            review.helpfulVoters.splice(helpfulIndex, 1);
            review.helpful = Math.max(0, review.helpful - 1);
        } else {
            // Add vote
            review.helpfulVoters.push(req.userID);
            review.helpful = (review.helpful || 0) + 1;

            // Remove from unhelpful if exists
            const unhelpfulIndex = review.unhelpfulVoters.findIndex(
                id => id.toString() === userId
            );
            if (unhelpfulIndex > -1) {
                review.unhelpfulVoters.splice(unhelpfulIndex, 1);
                review.unhelpful = Math.max(0, review.unhelpful - 1);
            }
        }

        await review.save();
        const populated = await Review.findById(review._id)
            .populate("reviewerId", "fname email isVerified");

        res.status(200).json(populated);
    } catch (error) {
        console.log("Vote error:", error.message);
        res.status(500).json({ error: "Failed to vote" });
    }
});

// Delete own review
router.delete("/reviews/:id", authenicate, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        if (review.reviewerId.toString() !== req.userID.toString()) {
            return res.status(403).json({ error: "Not authorized" });
        }

        const { targetType, targetId } = review;
        await Review.findByIdAndDelete(req.params.id);
        await updateRatingAggregation(targetType, targetId);

        res.status(200).json({ success: true });
    } catch (error) {
        console.log("Delete review error:", error.message);
        res.status(500).json({ error: "Failed to delete review" });
    }
});

// Admin: Get all reviews
router.get("/admin/reviews", authenicate, requireAdmin, async (req, res) => {
    try {
        const status = req.query.status;
        const query = status ? { status } : {};

        const reviews = await Review.find(query)
            .populate("reviewerId", "fname email")
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        console.log("Admin fetch reviews error:", error.message);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

// Admin: Moderate review
router.put("/admin/reviews/:id/moderate", authenicate, requireAdmin, async (req, res) => {
    try {
        const { status, moderationNote } = req.body;

        if (!["pending", "approved", "rejected"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        const { targetType, targetId } = review;
        review.status = status;
        if (moderationNote) {
            review.moderationNote = moderationNote;
        }

        await review.save();
        await updateRatingAggregation(targetType, targetId);

        res.status(200).json(review);
    } catch (error) {
        console.log("Moderate review error:", error.message);
        res.status(500).json({ error: "Failed to moderate review" });
    }
});

// Like/Unlike a product
router.post("/products/:id/like", authenicate, async (req, res) => {
    try {
        const { id } = req.params;
        const product = await products.findOne({ id });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const userId = req.userID;
        const likedIndex = product.likedBy.findIndex(
            likeId => likeId.toString() === userId.toString()
        );

        if (likedIndex > -1) {
            // Unlike
            product.likedBy.splice(likedIndex, 1);
            product.likeCount = Math.max(0, product.likeCount - 1);
        } else {
            // Like
            product.likedBy.push(userId);
            product.likeCount = (product.likeCount || 0) + 1;
        }

        await product.save();
        res.status(200).json({
            liked: likedIndex === -1,
            likeCount: product.likeCount
        });
    } catch (error) {
        console.log("Like product error:", error.message);
        res.status(500).json({ error: "Failed to like product" });
    }
});

// Get trending products
router.get("/products/trending", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const trending = await products.find()
            .sort({ popularity: -1, views: -1, likeCount: -1 })
            .limit(limit);

        res.status(200).json(trending.map(resolveProductCategory));
    } catch (error) {
        console.log("Trending products error:", error.message);
        res.status(500).json({ error: "Failed to fetch trending products" });
    }
});

// Get top-rated products
router.get("/products/top-rated", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const topRated = await products.find({ totalReviews: { $gt: 0 } })
            .sort({ averageRating: -1, totalReviews: -1 })
            .limit(limit);

        res.status(200).json(topRated.map(resolveProductCategory));
    } catch (error) {
        console.log("Top-rated products error:", error.message);
        res.status(500).json({ error: "Failed to fetch top-rated products" });
    }
});


module.exports = router;
