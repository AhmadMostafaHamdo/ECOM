const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// Public contact form
router.post("/contact", contactController.submitContact);

module.exports = router;
