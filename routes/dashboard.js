const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Routes
// MAHIKA: main dashboard render goes here
router.get("/", checkPushpaAuth, (req, res) => {
    res.send(`welcome`);
});

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
