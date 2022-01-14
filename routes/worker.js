const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Worker = require("../models/worker");

// Routes
router.get("/", checkWorkerAuth, (req, res) => {
    res.send("worker app here");
});

router.get("/auth", checkNotWorkerAuth, (req, res) => {
    res.render("worker/auth", { message: false });
});
router.post("/auth", async (req, res) => {
    let body = req.body;
    const userFound = await Worker.findOne({ username: body.username });

    if (!userFound) {
        res.render("worker/auth", { message: "No User found" });
    } else {
        let user = {
            id: userFound._id,
        };
        if (await bcrypt.compare(body.password, userFound.password)) {
            const accessToken = jwt.sign(
                user,
                process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: "24h",
                }
            );
            res.cookie("auth-token", accessToken, {
                maxAge: 2592000000,
            }).redirect("/worker");
        } else {
            res.render("worker/auth", { message: "Incorrect Password" });
        }
    }
});
router.get("/add", (req, res) => {
    res.render("add-worker");
});
router.post("/add", async (req, res) => {
    const { username, password } = req.body;
    const worker = new Worker({ username, password });

    try {
        await worker.save();
        res.clearCookie("auth-token").redirect("/worker/auth");
    } catch (err) {
        res.redirect("/err");
    }
});

router.get("/logout", checkWorkerAuth, (req, res) => {
    res.clearCookie("auth-token").redirect("/worker");
});

// MIDDLEWARE
function checkWorkerAuth(req, res, next) {
    let token = req.cookies["auth-token"];

    if (token == null) {
        res.redirect("/worker/auth");
    } else {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                res.redirect("/worker/auth");
            } else {
                req.user = user;
                next();
            }
        });
    }
}
function checkNotWorkerAuth(req, res, next) {
    let token = req.cookies["auth-token"];

    if (token == null) {
        next();
    } else {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                next();
            } else {
                res.redirect("/worker");
            }
        });
    }
}

module.exports = router;
