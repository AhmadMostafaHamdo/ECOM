const path = require("path");

module.exports = {
    CATEGORY_ALL: "All Categories",
    UNCATEGORIZED: "Uncategorized",
    USER_ROLES: new Set(["user", "admin"]),
    ONE_YEAR_MS: 1000 * 60 * 60 * 24 * 365,
    UPLOADS_DIR: path.join(__dirname, "..", "..", "uploads"),
    TEXT_FILTER_FIELDS: {
        brand: ["title.shortTitle", "title.longTitle", "description", "tagline"],
        color: ["description", "tagline"],
        material: ["description", "tagline"],
        type: ["description", "tagline"],
        style: ["description", "tagline"],
        fit: ["description", "tagline"],
        gender: ["description", "tagline"],
        size: ["description", "tagline"],
        availability: ["description", "tagline"],
        rating: ["description", "tagline"],
    }
};
