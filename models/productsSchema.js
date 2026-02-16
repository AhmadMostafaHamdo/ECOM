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
    url:String,
    detailUrl:String,
    images: [String],
    title:Object,
    price:Object,
    description:String,
    discount:String,
    tagline:String,
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
    }
}, {
    timestamps: true
});

const Products = new mongoose.model("products",productSchema);

module.exports = Products;
