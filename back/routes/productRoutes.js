const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authenticate = require("../middleware/authenticate");

router.get("/getproducts", productController.getProducts);
router.get("/getproductsone/:id", productController.getProductById);
router.get("/products/trending", productController.getTrendingProducts);

// Search and filter can use GET or POST
router.get("/products/filter", productController.filterProducts);
router.post("/products/filter", productController.filterProducts);

// Authentication required for these
router.post("/products", authenticate, productController.createProduct);
router.put("/products/:id", authenticate, productController.updateProduct);
router.delete("/products/:id", authenticate, productController.deleteProduct);

module.exports = router;
