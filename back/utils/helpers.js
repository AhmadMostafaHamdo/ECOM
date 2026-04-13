const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { ONE_YEAR_MS, UNCATEGORIZED } = require("./constants");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const keysecret = process.env.KEY;

const normalizeCategory = (value = "") => value.toString().trim().toLowerCase();

const generateSessionId = () => crypto.randomBytes(16).toString("hex");

const getClientIp = (req = {}) => {
    const forwarded = (req.headers?.["x-forwarded-for"] || "")
        .split(",")[0]
        .trim();
    return forwarded || req.connection?.remoteAddress || req.ip || "unknown";
};

const getViewerIdentity = (req, res) => {
    const viewer = {
        userId: null,
        sessionId: req.cookies?.viewSessionId || null,
        userAgent: req.get ? req.get("user-agent") || "" : "",
        ipHash: null,
    };

    if (!viewer.sessionId) {
        viewer.sessionId = generateSessionId();
        res.cookie("viewSessionId", viewer.sessionId, {
            maxAge: ONE_YEAR_MS,
            httpOnly: true,
            sameSite: "lax",
            secure: false,
        });
    }

    if (req.cookies?.eccomerce) {
        try {
            const verified = jwt.verify(req.cookies.eccomerce, keysecret);
            viewer.userId = verified?._id || null;
        } catch (error) {
            // ignore invalid token for view tracking
        }
    }

    const ipAddress = getClientIp(req);
    viewer.ipHash = crypto
        .createHash("sha256")
        .update(`${ipAddress}-${viewer.userAgent}`)
        .digest("hex");
    return viewer;
};

const escapeRegex = (value = "") =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const generateProductId = () =>
    `product_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

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
    const categoryValue =
        typeof product.category === "string" ? product.category.trim() : "";
    const shortTitleValue =
        typeof product?.title?.shortTitle === "string"
            ? product.title.shortTitle.trim()
            : "";

    return {
        ...product,
        id: (product.id || product._id).toString(),
        category: categoryValue || shortTitleValue || UNCATEGORIZED,
    };
};

const toSessionUser = (userDoc, token = null) => {
    const user = userDoc.toObject ? userDoc.toObject() : userDoc;

    return {
        _id: user._id,
        fname: user.fname,
        email: user.email,
        mobile: user.mobile,
        role: user.role || "user",
        country: user.country || "",
        token: token || (user.tokens && user.tokens.length > 0 ? user.tokens[user.tokens.length - 1].token : null),
        carts: Array.isArray(user.carts) ? user.carts : [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
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
        updatedAt: user.updatedAt,
        isBanned: user.isBanned || false,
        banReason: user.banReason || "",
        bannedAt: user.bannedAt || null,
    };
};

const toPublicProduct = (productDoc) => {
    const product = productDoc.toObject ? productDoc.toObject() : productDoc;

    return {
        ...resolveProductCategory(product),
        createdBy:
            product?.createdBy && typeof product.createdBy === "object"
                ? {
                    _id: product.createdBy._id,
                    fname: product.createdBy.fname,
                    email: product.createdBy.email,
                }
                : product.createdBy || null,
        locationDetail: product.locationDetail || { country: "", province: "", city: "" },
    };
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
    const shortTitle = (body.shortTitle || fallback?.title?.shortTitle || "")
        .toString()
        .trim();
    const longTitle = (body.longTitle || fallback?.title?.longTitle || "")
        .toString()
        .trim();
    const category = (body.category || fallback.category || UNCATEGORIZED)
        .toString()
        .trim();

    const cost = Number(body.cost || fallback?.price?.cost || 0);
    const mrp = Number(body.mrp || fallback?.price?.mrp || cost);
    const priceDiscount = (body.priceDiscount || fallback?.price?.discount || "")
        .toString()
        .trim();

    const images = parseImages(body.images);
    const primaryImage = (body.url || fallback.url || images[0] || "")
        .toString()
        .trim();
    const detailImage = (
        body.detailUrl ||
        fallback.detailUrl ||
        images[1] ||
        primaryImage ||
        ""
    )
        .toString()
        .trim();

    const calculatedDiscount = (Number.isFinite(mrp) && mrp > 0 && Number.isFinite(cost)
        ? `${Math.max(0, Math.round(((mrp - cost) / mrp) * 100))}%`
        : "0%");

    const discountValue = (body.offerText || body.discount || fallback.discount || "")
        .toString()
        .trim();

    return {
        category: category || UNCATEGORIZED,
        url: primaryImage,
        detailUrl: detailImage,
        images: images.length
            ? images
            : [primaryImage, detailImage].filter(Boolean),
        title: {
            shortTitle: shortTitle || longTitle || "Untitled Product",
            longTitle: longTitle || shortTitle || "Untitled Product",
        },
        description: (body.description || fallback.description || "")
            .toString()
            .trim(),
        // Root discount field should prioritize offerText but fallback to percentage discount if empty
        discount: discountValue || priceDiscount || calculatedDiscount,
        tagline: (body.tagline || fallback.tagline || "").toString().trim(),
        price: {
            mrp: Number.isFinite(mrp) ? mrp : 0,
            cost: Number.isFinite(cost) ? cost : 0,
            currency: body.currency || fallback?.price?.currency || "SYP",
            discount: priceDiscount || calculatedDiscount,
        },
        locationDetail: {
            country: body.country || fallback?.locationDetail?.country || "",
            province: body.province || fallback?.locationDetail?.province || "",
            city: body.city || fallback?.locationDetail?.city || "",
        },
        mobile: body.mobile || fallback?.mobile || "",
        tags: body.tags || fallback.tags || [],
        location: body.location || fallback.location || ""
    };
};

const optimizeImage = async (fileBuffer, filename) => {
    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const outputFilename = `${path.parse(filename).name}-${Date.now()}.webp`;
    const outputPath = path.join(uploadDir, outputFilename);

    await sharp(fileBuffer)
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);

    return outputFilename;
};

module.exports = {
    normalizeCategory,
    generateSessionId,
    getClientIp,
    getViewerIdentity,
    escapeRegex,
    generateProductId,
    buildTextFilterClause,
    resolveProductCategory,
    toSessionUser,
    toPublicUser,
    toPublicProduct,
    parseImages,
    buildProductPayload,
    optimizeImage,
    ONE_YEAR_MS,
    UNCATEGORIZED
};
