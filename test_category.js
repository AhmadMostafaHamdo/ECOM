require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./back/models/categorySchema");

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URL || "mongodb://localhost:27017/amazon_clone");
        console.log("Connected to MongoDB");

        const name = "CAR_" + Date.now();
        const newCategory = new Category({
            name: name,
            image: "https://en.wikipedia.org/wiki/Car"
        });

        await newCategory.save();
        console.log("Category saved successfully:", newCategory);
        process.exit(0);
    } catch (error) {
        console.error("Failed to save category:", error);
        process.exit(1);
    }
}

test();
