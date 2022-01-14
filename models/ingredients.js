const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IngredientSchema = new Schema({
    name: String,
    quantity: Number,
});

const model = mongoose.model("ingredients", IngredientSchema);

module.exports = model;
