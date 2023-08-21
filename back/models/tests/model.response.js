const mongoose = require ("mongoose");

const Schema = mongoose.Schema;

const responseSchema = new Schema (
    {
        text: String
    }
);

module.exports = mongoose.model('response', responseSchema);