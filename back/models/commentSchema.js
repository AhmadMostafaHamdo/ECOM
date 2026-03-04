const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        required: true,
        index: true
    },
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null,
        index: true
    },
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

commentSchema.index({ productId: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
