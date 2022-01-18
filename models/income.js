const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IncomeSchema = new Schema({
    quantity = Number
});

const model = mongoose.model("income", IncomeSchema);

module.exports = model;