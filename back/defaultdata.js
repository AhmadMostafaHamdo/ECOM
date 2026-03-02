const productdata = require("./constant/productsdata");
const Products = require("./models/productsSchema");
const Category = require("./models/categorySchema");

const DefaultData = async()=>{
    try {
        await Products.deleteMany({});
        await Products.insertMany(productdata);

        const categoryNames = [
            ...new Set([
                ...productdata
                    .map((product) => product.category)
                    .filter(Boolean)
                    .map((name) => name.trim()),
                "Uncategorized"
            ])
        ];

        await Category.deleteMany({});
        await Category.insertMany(categoryNames.map((name) => ({ name })));

        console.log("seed completed successfully");
    } catch (error) {
        console.log("error" + error.message);
    }
};

module.exports = DefaultData;
