const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        required: true
    }],
    productId: {
        type: String,
        default: null,
        index: true
    },
    lastMessage: {
        text: { type: String, default: "" },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "USER" },
        createdAt: { type: Date, default: Date.now }
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    }
}, {
    timestamps: true
});

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
