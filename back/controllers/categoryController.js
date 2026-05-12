const Category = require("../models/categorySchema");
const products = require("../models/productsSchema");
const mongoose = require("mongoose");
const {
    normalizeCategory,
    escapeRegex,
    optimizeImage,
    getLocalizedNameValue,
    getCategoryValue,
} = require("../utils/helpers");
const { CATEGORY_ALL, UNCATEGORIZED } = require("../utils/constants");
const { asyncHandler } = require("../middleware/errorMiddleware");

const parseJson = (value, fallback) => {
    if (value === undefined || value === null) return fallback;
    if (typeof value !== "string") return value;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

const toLocalizedName = (rawName, body = {}, prefix = "name") => {
    const parsedName = parseJson(rawName, rawName);
    const fromObject = parsedName && typeof parsedName === "object" && !Array.isArray(parsedName)
        ? parsedName
        : {};

    const en = (
        body[`${prefix}En`] ??
        fromObject.en ??
        (typeof parsedName === "string" ? parsedName : "")
    ).toString().trim();
    const ar = (body[`${prefix}Ar`] ?? fromObject.ar ?? "").toString().trim();

    return { en, ar };
};

const primaryName = (name) => getLocalizedNameValue(name, "en");
const cleanImage = (image = "") => image.toString().trim().substring(0, 2048);

const getFiles = (req) => {
    if (Array.isArray(req.files)) return req.files;
    if (req.file) return [req.file];
    if (req.files && typeof req.files === "object") return Object.values(req.files).flat();
    return [];
};

const fileUrlFromUpload = async (file) => {
    if (!file) return "";
    const filename = await optimizeImage(file.buffer, file.originalname);
    return `/uploads/${filename}`;
};

const getCategoryFile = (req) =>
    getFiles(req).find((file) => ["imageFile", "categoryImage", "image"].includes(file.fieldname));

const getSubCategoryFile = (req, index) => {
    const files = getFiles(req);
    return (
        files.find((file) => file.fieldname === `subCategoryImage_${index}`) ||
        files.filter((file) => file.fieldname === "subCategoryImages")[index]
    );
};

const parseSubCategories = async (req, fallback = []) => {
    const raw = parseJson(req.body.subCategories, []);
    const subCategories = Array.isArray(raw) ? raw : [];

    const parsed = await Promise.all(subCategories.map(async (item, index) => {
        const existing = fallback[index] || {};
        const name = toLocalizedName(item?.name, {
            nameEn: item?.nameEn,
            nameAr: item?.nameAr,
        });
        const displayName = primaryName(name) || getLocalizedNameValue(name, "ar") || getLocalizedNameValue(existing.name);
        const uploadedImage = await fileUrlFromUpload(getSubCategoryFile(req, index));
        const value = (item?.value || item?.slug || displayName || existing.value || "").toString().trim();

        return {
            _id: item?._id && mongoose.Types.ObjectId.isValid(item._id) ? item._id : undefined,
            name,
            image: uploadedImage || cleanImage(item?.image ?? existing.image ?? ""),
            slug: (item?.slug || value).toString().trim().toLowerCase().replace(/\s+/g, "-"),
            value,
            active: item?.active === undefined ? existing.active !== false : item.active !== false,
        };
    }));

    return parsed.filter((item) => {
        const en = primaryName(item.name);
        const ar = getLocalizedNameValue(item.name, "ar");
        return en.length >= 2 || ar.length >= 2;
    });
};

const buildCategorySearchQuery = (search) => {
    if (!search) return {};
    const searchRegex = new RegExp(escapeRegex(search), "i");
    return {
        $or: [
            { normalizedName: searchRegex },
            { name: searchRegex },
            { "name.en": searchRegex },
            { "name.ar": searchRegex },
        ],
    };
};

const getCategoryDashboardPayload = async (categories = null) => {
    const [categoryDocs, productsData] = await Promise.all([
        categories || Category.find().sort({ normalizedName: 1 }).lean(),
        products.find({}, { category: 1, subCategory: 1 }).lean(),
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
        subCategories: categoryDoc.subCategories || [],
        productCount: productCountByCategory[getCategoryValue(categoryDoc)] || 0,
    }));
};

exports.getCategories = asyncHandler(async (req, res) => {
    const pageNum = Math.max(1, parseInt(req.query.page) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [categoryDocs, totalItems] = await Promise.all([
        Category.find({}, { name: 1, image: 1, subCategories: 1, _id: 1 })
            .sort({ normalizedName: 1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Category.countDocuments({}),
    ]);

    const total = totalItems + (pageNum === 1 ? 1 : 0);
    res.status(200).json({
        data: pageNum === 1
            ? [{ _id: "all", name: CATEGORY_ALL, image: "", subCategories: [] }, ...categoryDocs]
            : categoryDocs,
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
    });
});

exports.getDashboardCategories = asyncHandler(async (req, res) => {
    const payload = await getCategoryDashboardPayload();
    res.status(200).json(payload);
});

exports.getAdminCategories = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;
    const query = buildCategorySearchQuery(search);

    const [categories, totalItems] = await Promise.all([
        Category.find(query).sort({ normalizedName: 1 }).skip(skip).limit(limitNum).lean(),
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
});

exports.getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid category ID" });
    }

    const category = await Category.findById(id).lean();
    if (!category) return res.status(404).json({ error: "Category not found" });

    res.status(200).json(category);
});

exports.createCategory = asyncHandler(async (req, res) => {
    const name = toLocalizedName(req.body.name, req.body);
    const categoryName = primaryName(name) || getLocalizedNameValue(name, "ar");
    const normalizedName = normalizeCategory(categoryName);
    const uploadedImage = await fileUrlFromUpload(getCategoryFile(req));
    const image = uploadedImage || req.body.image;

    if (!categoryName || categoryName.length < 2) {
        return res.status(422).json({ error: "Category name must be at least 2 characters" });
    }

    if (categoryName.length > 100) {
        return res.status(422).json({ error: "Category name must be at most 100 characters" });
    }

    if (normalizedName === normalizeCategory(CATEGORY_ALL)) {
        return res.status(400).json({ error: `"${CATEGORY_ALL}" is a reserved label` });
    }

    if (image && cleanImage(image).length > 2048) {
        return res.status(422).json({ error: "Image URL too long" });
    }

    const existingCategory = await Category.findOne({ normalizedName });
    if (existingCategory) return res.status(409).json({ error: "Category already exists" });

    const createdCategory = await Category.create({
        name,
        image: image ? cleanImage(image) : "",
        subCategories: await parseSubCategories(req),
    });

    res.status(201).json(createdCategory);
});

exports.updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid category ID" });
    }

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    const oldCategoryName = getCategoryValue(category);
    if (normalizeCategory(oldCategoryName) === normalizeCategory(UNCATEGORIZED)) {
        return res.status(400).json({ error: `Cannot rename "${UNCATEGORIZED}" category` });
    }

    const name = toLocalizedName(req.body.name, req.body);
    const nextName = primaryName(name) || getLocalizedNameValue(name, "ar");
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

    if (normalizedName !== normalizeCategory(oldCategoryName)) {
        await products.updateMany(
            { category: { $regex: `^${escapeRegex(oldCategoryName)}$`, $options: "i" } },
            { $set: { category: nextName } }
        );
    }

    const uploadedImage = await fileUrlFromUpload(getCategoryFile(req));
    category.name = name;
    if (uploadedImage) category.image = uploadedImage;
    else if (typeof req.body.image === "string") category.image = cleanImage(req.body.image);
    category.subCategories = await parseSubCategories(req, category.subCategories || []);
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

    const categoryName = getCategoryValue(category);
    if (normalizeCategory(categoryName) === normalizeCategory(UNCATEGORIZED)) {
        return res.status(400).json({ error: `Cannot delete "${UNCATEGORIZED}" category` });
    }

    let uncategorizedCategory = await Category.findOne({ normalizedName: normalizeCategory(UNCATEGORIZED) });
    if (!uncategorizedCategory) uncategorizedCategory = await Category.create({ name: UNCATEGORIZED });

    await products.updateMany(
        { category: { $regex: `^${escapeRegex(categoryName)}$`, $options: "i" } },
        { $set: { category: getCategoryValue(uncategorizedCategory), subCategory: "" } }
    );

    await Category.findByIdAndDelete(category._id);
    res.status(200).json({ success: true, deletedCategoryId: category._id });
});
