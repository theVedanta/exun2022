if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 4000;
const dbURI = process.env.DB_URL;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Grid = require("gridfs-stream");

// DB CONNECTION
async function connectDB() {
    await mongoose.connect(dbURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    // Start server
    app.listen(PORT, () => console.log(`Listening on ${PORT}...`));
}
connectDB();

// SETTINGS
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + "/public"));
app.use(cors());

// GRIDFS SETTINGS
const conn = mongoose.connection;
let gfs;
conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("fs");
});

// ROUTES
app.get("/", (req, res) => res.redirect("/worker"));

app.use("/dashboard", require("./routes/dashboard"));

app.use("/worker", require("./routes/worker"));

app.use("/api", require("./routes/api"));

// Imgs
app.get("/img/:filename", async (req, res) => {
    try {
        let file = await gfs.files.findOne({ filename: req.params.filename });
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
    } catch (err) {
        res.redirect("/err");
    }
});

app.get("/err", (req, res) => {
    res.send("<h1>Some error occurred</h1>");
});

app.get("*", (req, res) => {
    res.send("Error 404, Not found");
});
