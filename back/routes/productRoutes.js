const express = require("express");
const router = express.Router();
const { cacheMiddleware } = require("../middleware/cacheMiddleware");
const productController = require("../controllers/productController");
const authenticate = require("../middleware/authenticate");

router.get("/getproducts", cacheMiddleware(300), productController.getProducts); // Cache for 5 mins
router.get("/getproductsone/:id", cacheMiddleware(600), productController.getProductById); // Cache for 10 mins
router.get("/products/trending", cacheMiddleware(1800), productController.getTrendingProducts); // Cache for 30 mins

// Search and filter can use GET or POST
router.get("/products/filter", cacheMiddleware(300), productController.filterProducts);
router.post("/products/filter", productController.filterProducts);

// Authentication required for these
router.post("/products", authenticate, productController.createProduct);
router.put("/products/:id", authenticate, productController.updateProduct);
router.delete("/products/:id", authenticate, productController.deleteProduct);

module.exports = router;
