const mongoose = require('mongoose');
require('dotenv').config();

const categorySchema = new mongoose.Schema({
    name: String,
    normalizedName: String
});

const Category = mongoose.model('Category', categorySchema);

async function test() {
    try {
        const dbUrl = process.env.DATABASE || 'mongodb://127.0.0.1:27017/ecommerceapp';
        await mongoose.connect(dbUrl);
        console.log('Connected');

        const cats = await Category.find({});
        console.log('Categories:', cats.map(c => c.name));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
