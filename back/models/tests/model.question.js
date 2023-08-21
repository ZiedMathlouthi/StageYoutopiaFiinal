const mongoose = require ("mongoose");

const Schema = mongoose.Schema;

const questionSchema = new Schema(
    {
        questionTitle: { type: String, required: true },
        suggestedResponse: [ String ],
        correctResponse: String
    }
);

module.exports = mongoose.model('question', questionSchema);