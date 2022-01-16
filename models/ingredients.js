const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IngredientSchema = new Schema({
    name: String,
    quantity: Number, // out of 100
});

const model = mongoose.model("ingredients", IngredientSchema);

module.exports = model;

/*

ingredients for each product are allotted according to number of products. for eg.

2 chocolates: 
1st has cocoa quantity as 20%;
2nd one has it has 40%;

cocoa level currrently is 100%

so, every product will have 50% 50% share of cocoa
every chocolate will have take 20%/40% of cocoa per 1 percent for 1 chocolate.

*/
