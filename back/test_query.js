const mongoose = require('mongoose');
require('dotenv').config();

const productsSchema = new mongoose.Schema({
    id: String,
    url: String,
    detailUrl: String,
    title: Object,
    price: Object,
    description: String,
    discount: String,
    tagline: String,
    category: String
});

const products = mongoose.model('products', productsSchema);

async function test() {
    try {
        const dbUrl = process.env.DATABASE || 'mongodb://127.0.0.1:27017/ecommerceapp';
        await mongoose.connect(dbUrl);
        console.log('Connected');

        const query = {};
        const pageNum = 1;
        const limitNum = 12;
        const skip = (pageNum - 1) * limitNum;

        const productsData = await products.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum);
        console.log('Products found:', productsData.length);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
