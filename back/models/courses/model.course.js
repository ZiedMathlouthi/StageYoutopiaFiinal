const mongoose = require("mongoose");

const Schema = mongoose.Schema;


const courseSchema = new Schema (
    {
        courseName: { type: String, required: true },
        courseDescription: { type: String, required: true },
        listofRates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rating" }],
        courseContent: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'chapterModel'
            }
        ],
        coursePhoto: String, // when you change this go the controller and change
        courseOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'expert', required: true},
        courseSubcribed: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
            }
        ]
    }
);

module.exports = mongoose.model('courses', courseSchema);