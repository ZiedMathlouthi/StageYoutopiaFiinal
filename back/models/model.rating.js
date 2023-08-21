const mongoose = require("mongoose");
const ratingSchema = new mongoose.Schema({
  subject: {
    type: String,
    enum: ["user", "company", "course"],
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "subject",
  },
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    maxlength: 500,
  },
});

module.exports = mongoose.model("Rating", ratingSchema);