const router = require("express").Router();
const Product = require("../models/product");

// Routes
router.get("/products", async (req, res) => {
    const products = await Product.find();
    res.json({ products });
});

module.exports = router;
