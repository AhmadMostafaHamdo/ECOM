const mongoose = require("mongoose");

const DB = process.env.DATABASE || process.env.MONGO_URI;

const connectDB = async () => {
    if (!DB) {
        throw new Error("DATABASE (or MONGO_URI) is not set in environment");
    }

    // Fail fast when DB is unreachable instead of buffering operations indefinitely.
    mongoose.set("bufferCommands", false);
    await mongoose.connect(DB);
    console.log("connection is successfully done");
};

module.exports = connectDB;
