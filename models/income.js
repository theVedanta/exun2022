const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IncomeSchema = new Schema({
    value: Number,
    history: Array,
});

const model = mongoose.model("income", IncomeSchema);

module.exports = model;
