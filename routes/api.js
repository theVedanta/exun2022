const router = require("express").Router();
const Product = require("../models/product");
const Ingredient = require("../models/ingredients");
const Order = require("../models/order");
const Income = require("../models/income");

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

router.post("/place", async (req, res) => {
    try {
        let money = 0;
        const incomeObj = await Income.find();

        for (let ord of req.body.orders) {
            const quan = ord.quantity;
            const product = await Product.findById(ord.id);
            const milk = await Ingredient.findOne({ name: "Milk" });
            const cocoa = await Ingredient.findOne({ name: "Cocoa" });
            const chocolate = await Ingredient.findOne({ name: "Chocolate" });

            const chocoGraph = {
                dark: 3,
                normal: 2,
                light: 1,
            };

            const milkUsed =
                parseInt(product.recoms.servings) *
                parseInt(product.recoms.milk) *
                (33 / 100) *
                quan;
            const cocoaUsed =
                product.recoms.type === "chocolate"
                    ? parseInt(product.recoms.servings) *
                      parseInt(product.recoms.milk) *
                      (33 / 100) *
                      quan
                    : 0;

            const chocolateUsed =
                chocoGraph[product.recoms.flavour] *
                parseInt(product.recoms.cocoa) *
                (33 / 100) *
                quan;

            await Ingredient.updateOne(
                { _id: milk._id },
                {
                    $set: {
                        quantity: milk.quantity - milkUsed,
                    },
                }
            );
            await Ingredient.updateOne(
                { _id: cocoa._id },
                {
                    $set: {
                        quantity: cocoa.quantity - cocoaUsed,
                    },
                }
            );
            await Ingredient.updateOne(
                { _id: chocolate._id },
                {
                    $set: {
                        quantity: chocolate.quantity - chocolateUsed / 2,
                    },
                }
            );

            money += incomeObj[0].value + product.price * quan;

            let date = new Date();
            // store only day and month and year
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            date = `${day}/${month}/${year}`;

            let order = new Order({
                productId: ord.id,
                quantity: ord.quantity,
                date,
            });
            await order.save();
        }

        const history = incomeObj[0].history;
        history.push({ date: new Date(), value: money });

        await Income.updateOne(
            { _id: incomeObj[0]._id },
            { $set: { value: money, history } }
        );

        res.json({ done: true });
    } catch (err) {
        res.json({ err });
    }
});

module.exports = router;
