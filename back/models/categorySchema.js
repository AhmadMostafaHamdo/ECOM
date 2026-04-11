const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50
        },
        image: {
            type: String,
            required: false,
            default: ""
        },
        normalizedName: {
            type: String,
            required: true,
            unique: true,
            index: true
        }
    },
    {
        timestamps: true
    }
);

categorySchema.pre("validate", function () {
    if (typeof this.name === "string") {
        this.name = this.name.trim();
        this.normalizedName = this.name.toLowerCase();
    }
});

const Category = mongoose.model("categories", categorySchema);

module.exports = Category;

