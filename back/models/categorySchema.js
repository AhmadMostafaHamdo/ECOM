const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
    {
        name: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        image: {
            type: String,
            default: "",
        },
        slug: {
            type: String,
            default: "",
            trim: true,
        },
        value: {
            type: String,
            default: "",
            trim: true,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    { _id: true }
);

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        image: {
            type: String,
            required: false,
            default: ""
        },
        subCategories: {
            type: [subCategorySchema],
            default: [],
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
    const normalize = (value = "") => value.toString().trim().toLowerCase();
    const cleanLocalizedName = (value) => {
        if (value && typeof value === "object" && !Array.isArray(value)) {
            return {
                en: (value.en || "").toString().trim(),
                ar: (value.ar || "").toString().trim(),
            };
        }
        return (value || "").toString().trim();
    };

    this.name = cleanLocalizedName(this.name);

    const primaryName =
        typeof this.name === "string"
            ? this.name
            : this.name?.en || this.name?.ar || "";

    if (primaryName) {
        this.normalizedName = normalize(primaryName);
    }

    if (Array.isArray(this.subCategories)) {
        this.subCategories = this.subCategories.map((subCategory) => {
            const sub = subCategory.toObject ? subCategory.toObject() : subCategory;
            const name = cleanLocalizedName(sub.name);
            const primarySubName =
                typeof name === "string" ? name : name?.en || name?.ar || "";
            const value = (sub.value || sub.slug || primarySubName).toString().trim();
            return {
                ...sub,
                name,
                value,
                slug: (sub.slug || value).toString().trim().toLowerCase().replace(/\s+/g, "-"),
                image: (sub.image || "").toString().trim(),
                active: sub.active !== false,
            };
        });
    }
});

const Category = mongoose.model("categories", categorySchema);

module.exports = Category;

