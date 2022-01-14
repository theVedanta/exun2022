const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WorkerSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});

const model = mongoose.model("worker", WorkerSchema);

module.exports = model;
