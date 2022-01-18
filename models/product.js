const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: String,
    desc: String,
    price: Number,
    img: String,
    // ingredients: Array,
    recoms: Object,
});

const model = mongoose.model("products", ProductSchema);

module.exports = model;

/*
let recoms = {
    type: "chocolate",
    cocoa: 1/2/3,
    milk: 1/2/3
    servings: 1/2/4,
    flavour: "dark"/"light"/"normal",
}
*/
