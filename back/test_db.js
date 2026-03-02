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
        console.log('Connecting to:', dbUrl);
        await mongoose.connect(dbUrl);
        console.log('Connected to DB');
        const count = await products.countDocuments({});
        console.log('Total products:', count);
        if (count > 0) {
            const sample = await products.find({}).limit(1);
            console.log('Sample product:', JSON.stringify(sample, null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
