const router = require("express").Router();
const Product = require("../models/product");

// Routes
router.get("/products", async (req, res) => {
    const products = await Product.find();
    res.json({ products });
});

router.post("/suggest-engine", async (req, res) => {
    const body = req.body;
    const products = await Product.find();
    let scoreCard = [];
    let highestScore = 0;

    for (let product of products) {
        let scoreObj = { id: product._id, score: 0 };
        // QUESTIONS
        if (product.recoms.type === body.type) {
            scoreObj.score++;
        }
        if (product.recoms.cocoa === body.cocoa) {
            scoreObj.score++;
        }
        if (product.recoms.milk === body.milk) {
            scoreObj.score++;
        }
        if (product.recoms.servings === body.servings) {
            scoreObj.score++;
        }
        if (product.recoms.flavour === body.flavour) {
            scoreObj.score++;
        }

        // CHECK Score for highest
        if (scoreObj.score > highestScore) highestScore = scoreObj.score;

        scoreCard.push(scoreObj);
    }

    for (let product of scoreCard) {
        if (product.score === highestScore) {
            const getProduct = await Product.findById(product.id);
            res.json({ product: getProduct });
        }
    }
});

module.exports = router;
