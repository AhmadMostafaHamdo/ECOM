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
    title: Object,
    price: Object,
    description: String,
    discount: String,
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
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
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
        default: 0
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

const Products = new mongoose.model("products", productSchema);

module.exports = Products;
