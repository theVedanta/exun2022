const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: String,
    desc: String,
    price: Number,
    img: String,
});

const model = mongoose.model("products", ProductSchema);

module.exports = model;
