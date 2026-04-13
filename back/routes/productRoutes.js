const express = require("express");
const router = express.Router();
const { cacheMiddleware } = require("../middleware/cacheMiddleware");
const productController = require("../controllers/productController");
const authenticate = require("../middleware/authenticate");

router.get("/getproducts", cacheMiddleware(300), productController.getProducts); // Cache for 5 mins
router.get("/getproductsone/:id", cacheMiddleware(600), productController.getProductById); // Cache for 10 mins
router.get("/products/trending", cacheMiddleware(1800), productController.getTrendingProducts); // Cache for 30 mins
router.get("/products/top-rated", cacheMiddleware(1800), productController.getTopRatedProducts); // Cache for 30 mins
router.get("/products/discounted", cacheMiddleware(1800), productController.getDiscountedProducts); // Cache for 30 mins

// Search and filter can use GET or POST
router.get("/products/filter", cacheMiddleware(300), productController.filterProducts);
router.post("/products/filter", productController.filterProducts);

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // increase to 10MB
});

// Authentication required for these
router.get("/products/mine", authenticate, productController.getMyProducts);
router.get("/profile/products", authenticate, productController.getMyProducts);
router.post("/products", authenticate, upload.array("images", 5), productController.createProduct);
router.put("/products/:id", authenticate, upload.array("images", 5), productController.updateProduct);
router.delete("/products/:id", authenticate, productController.deleteProduct);
router.post("/products/:id/like", authenticate, productController.likeProduct);

module.exports = router;
