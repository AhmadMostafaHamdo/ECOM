const mongoose = require('mongoose');
require('dotenv').config();

const productsSchema = new mongoose.Schema({
    totalReviews: Number,
    discount: String,
    views: Number
});

const products = mongoose.model('products', productsSchema);

async function check() {
    try {
        const dbUrl = process.env.DATABASE || 'mongodb://127.0.0.1:27017/ecommerceapp';
        await mongoose.connect(dbUrl);

        const tr = await products.countDocuments({ totalReviews: { $gt: 0 } });
        const disc = await products.countDocuments({ discount: { $exists: true, $nin: ["0", "0%", ""] } });
        const all = await products.countDocuments({});

        console.log('Total Products:', all);
        console.log('Top Rated (>0 reviews):', tr);
        console.log('Discounted:', disc);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
