const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const progressionCourseSchema = new Schema (
    {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
        chapterProgression: { type: Number, min:1, default:1 },
    }
);

module.exports = mongoose.model('progressionCourse', progressionCourseSchema);