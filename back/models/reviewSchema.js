const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    // Review target (either product or user)
    targetType: {
        type: String,
        enum: ["product", "user"],
        required: true,
        index: true
    },
    targetId: {
        type: String,
        required: true,
        index: true
    },
    
    // Reviewer information
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        required: true,
        index: true
    },
    
    // Review content
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        trim: true,
        maxlength: 200
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 2000
    },
    
    // Metadata
    verifiedPurchase: {
        type: Boolean,
        default: false
    },
    helpful: {
        type: Number,
        default: 0
    },
    unhelpful: {
        type: Number,
        default: 0
    },
    helpfulVoters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER"
    }],
    unhelpfulVoters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER"
    }],
    
    // Moderation
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "approved"
    },
    moderationNote: String
}, {
    timestamps: true
});

// Compound index to prevent duplicate reviews
reviewSchema.index({ targetType: 1, targetId: 1, reviewerId: 1 }, { unique: true });

// Index for efficient queries
reviewSchema.index({ targetType: 1, targetId: 1, status: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
