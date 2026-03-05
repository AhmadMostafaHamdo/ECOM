const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        required: true
    },
    // Type of the report: 'product' or 'user'
    targetType: {
        type: String,
        enum: ["product", "user"],
        required: true
    },
    // The ID of the reported product or user
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "targetModelRef"
    },
    // Dynamic reference based on targetType
    targetModelRef: {
        type: String,
        enum: ["products", "USER"],
        required: true
    },
    reason: {
        type: String,
        enum: [
            "spam",
            "fake",
            "inappropriate",
            "fraud",
            "violence",
            "harassment",
            "misleading",
            "other"
        ],
        required: true
    },
    description: {
        type: String,
        maxlength: 1000,
        default: ""
    },
    status: {
        type: String,
        enum: ["pending", "reviewed", "resolved", "dismissed"],
        default: "pending"
    },
    adminNote: {
        type: String,
        default: ""
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Prevent duplicate reports from the same user for the same target
reportSchema.index({ reporter: 1, targetType: 1, targetId: 1 }, { unique: true });

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
