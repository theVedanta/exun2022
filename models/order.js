const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    productId: String,
    quantity: Number,
});

const model = mongoose.model("orders", OrderSchema);

module.exports = model;
