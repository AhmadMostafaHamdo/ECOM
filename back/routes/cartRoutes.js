const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const authenticate = require("../middleware/authenticate");

router.post("/addcart/:id", authenticate, cartController.addToCart);
router.get("/cartdetails", authenticate, cartController.getCartDetails);
router.delete("/remove/:id", authenticate, cartController.removeFromCart);

module.exports = router;
