const mongoose = require("mongoose");

const productViewSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        index: true,
        sparse: true
    },
    sessionId: {
        type: String,
        index: true,
        sparse: true
    },
    ipHash: {
        type: String,
        index: true,
        sparse: true
    },
    userAgent: String
}, {
    timestamps: true
});

productViewSchema.index(
    { productId: 1, userId: 1 },
    {
        unique: true,
        partialFilterExpression: { userId: { $exists: true } }
    }
);

productViewSchema.index(
    { productId: 1, sessionId: 1 },
    {
        unique: true,
        partialFilterExpression: { sessionId: { $exists: true } }
    }
);

productViewSchema.index(
    { productId: 1, ipHash: 1 },
    {
        unique: true,
        partialFilterExpression: { ipHash: { $exists: true } }
    }
);

module.exports = mongoose.model("ProductView", productViewSchema);
