const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StatsSchema = new Schema({
    data: {
        type: String,
        required: true,
        unique: true,
    },
    date: {
        type: String,
        required: true,
    },
});

const model = mongoose.model("stats", StatsSchema);

module.exports = model;
