const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    category: {
        type: String,
        required: true,
        trim: true,
        default: "Uncategorized",
        index: true
    },
    url: String,
    detailUrl: String,
    images: [String],
    title: {
        shortTitle: { type: String, required: true, index: true },
        longTitle: { type: String, required: true, index: true }
    },
    price: {
        mrp: Number,
        cost: { type: Number, index: true },
        discount: String,
        currency: { type: String, default: "SYP" }
    },
    locationDetail: {
        country: { type: String, default: "" },
        province: { type: String, default: "" },
        city: { type: String, default: "" }
    },
    mobile: {
        type: String,
        default: ""
    },
    description: String,
    discount: { type: String, index: true },
    tagline: String,
    views: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        default: null
    },
    // Enhanced rating system
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        index: true
    },
    totalReviews: {
        type: Number,
        default: 0,
        index: true
    },
    ratingDistribution: {
        5: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        1: { type: Number, default: 0 }
    },
    // Advanced filtering fields
    tags: [String],
    location: String,
    popularity: {
        type: Number,
        default: 0,
        index: true
    },
    // Like functionality
    likeCount: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER"
    }]
}, {
    timestamps: true
});

// Optimize database performance with a text index for full-text search
productSchema.index({
    "title.shortTitle": "text",
    "title.longTitle": "text",
    description: "text",
    category: "text"
}, {
    weights: {
        "title.shortTitle": 10,
        "title.longTitle": 5,
        category: 3,
        description: 1
    },
    name: "ProductTextIndex"
});

// Add indexing for sorting optimization
productSchema.index({ createdAt: -1 });
productSchema.index({ category: 1, createdAt: -1 });

const Products = new mongoose.model("products", productSchema);

module.exports = Products;
