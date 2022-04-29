const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const GlobalSchema = new Schema({
    onDbUsage: {
        type: Number
    }
});

module.exports = mongoose.model("global", GlobalSchema);