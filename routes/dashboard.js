const express = require("express");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Product = require("../models/product");
const Worker = require("../models/worker");
const Ingredient = require("../models/ingredients");
const tinify = require("tinify");
tinify.key = process.env.TINIFY;
const fs = require("fs");
const multer = require("multer");
const Grid = require("gridfs-stream");
const path = require("path");
const mongoose = require("mongoose");
const uuid = require("uuid");
const Income = require("../models/income");

// GRIDFS SETTINGS
const conn = mongoose.connection;
let gfs;
conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("fs");
});

const storage = multer.diskStorage({
    destination: ".",
    filename: (req, file, cb) => {
        if (
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/jpeg"
        ) {
            cb(
                null,
                `${uuid.v4()}-${Date.now()}` + path.extname(file.originalname)
            );
        } else {
            cb(null, "no file");
        }
    },
});
const upload = multer({ storage: storage, limits: { fileSize: 4194304 } });

// Routes
router.get("/", checkPushpaAuth, async (req, res) => {
    const imgObj = {
        0: "/assets/low.png",
        50: "/assets/mid.png",
        100: "/assets/high.png",
    };
    const milk = await Ingredient.findOne({ name: "Milk" });
    const cocoa = await Ingredient.findOne({ name: "Cocoa" });
    const chocolate = await Ingredient.findOne({ name: "Chocolate" });

    const data = await Income.find();
    let valArr = [];
    for (let val of data[0].history) {
        valArr.push(val.value);
    }

    let dateArr = [];
    for (let val of data[0].history) {
        dateArr.push(`${val.date.getDate()}/${val.date.getMonth() + 1}`);
    }

    res.render("dash/dash", {
        message: false,
        milk: milk.quantity,
        cocoa: cocoa.quantity,
        chocolate: chocolate.quantity,
        imgObj,
        valArr,
        dateArr,
        value: data[0].value,
    });
});
router.get("/schedule", (req, res) => {
    res.render("dash/schedule");
});

// AUTH
router.get("/auth", checkNotPushpaAuth, (req, res) => {
    res.render("dash/auth", { message: false });
});
router.post("/auth", async (req, res) => {
    let body = req.body;

    if (await bcrypt.compare(body.password, process.env.PUSHPA_PASSWORD)) {
        const accessToken = jwt.sign(
            { user: "pushpa" },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "24h",
            }
        );
        res.cookie("auth-token-pushpa", accessToken, {
            maxAge: 2592000000,
        }).redirect("/dashboard");
    } else {
        res.render("dash/auth", { message: "Incorrect Password" });
    }
});
router.get("/logout", checkPushpaAuth, (req, res) => {
    res.clearCookie("auth-token-pushpa").redirect("/dashboard");
});

// Products
router.get("/products", checkPushpaAuth, async (req, res) => {
    const products = await Product.find();
    res.render("dash/products", { products });
});
router.get("/products/:id", checkPushpaAuth, async (req, res) => {
    const product = await Product.findById(req.params.id);
    console.log(product);
    res.render("dash/product-single", { product });
});
// router.get("/products/add", checkPushpaAuth, async (req, res) => {
//     const products = await Product.find();
//     const ingredients = await Ingredient.find();
//     res.render("dash/add-products", { products, ingredients });
// });
router.post("/products/add", upload.single("img"), async (req, res) => {
    try {
        const { name, price, desc, type, cocoa, milk, servings, flavour } =
            req.body;

        let filename = `${uuid.v4()}-${Date.now()}.jpg`;
        const writeStream = gfs.createWriteStream(filename);
        let source = tinify.fromFile(req.file.filename);
        source.toFile("toConvert.jpg").then(() => {
            setTimeout(() => {
                fs.createReadStream(`./toConvert.jpg`).pipe(writeStream);
                fs.unlink("toConvert.jpg", (err) => {
                    if (err) {
                        console.log(err);
                        res.send(err);
                    }
                });
            }, 1000);
        });
        fs.unlink(`${req.file.filename}`, (err) => {
            if (err) {
                res.send(err);
            }
        });

        // Ingredients
        // const ings = await Ingredient.find();
        // let ingredients = [];
        // for (let ing of ings) {
        //     const id = ing._id.toString();
        //     if (req.body[id] !== "1") {
        //         ingredients.push({ id, quantity: parseInt(req.body[id]) });
        //     }
        // }

        // Recoms
        const recoms = {
            type,
            cocoa,
            milk,
            servings,
            flavour,
        };

        // SAVE
        let product = new Product({
            name,
            price,
            desc,
            recoms,
            img: filename,
        });
        await product.save();

        res.redirect("/dashboard/products");
    } catch (err) {
        res.redirect("/err");
        fs.unlink("no file", (err) => {});
    }
});
router.get("/products/delete/:id", async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id });
    gfs.remove(
        { filename: product.img, root: "fs" },
        async (err, gridStore) => {
            if (err) {
                res.redirect(err);
            } else {
                await Product.deleteOne({ _id: req.params.id });
                res.redirect("/dashboard/products");
            }
        }
    );
});

// MIDDLEWARE
function checkPushpaAuth(req, res, next) {
    let token = req.cookies["auth-token-pushpa"];

    if (token == null) {
        res.redirect("/dashboard/auth");
    } else {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                res.redirect("/dashboard/auth");
            } else {
                req.pushpa = user;
                next();
            }
        });
    }
}
function checkNotPushpaAuth(req, res, next) {
    let token = req.cookies["auth-token-pushpa"];

    if (token == null) {
        next();
    } else {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                next();
            } else {
                res.redirect("/dashboard");
            }
        });
    }
}

module.exports = router;
