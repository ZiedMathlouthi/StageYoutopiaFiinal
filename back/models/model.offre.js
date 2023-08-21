const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const offerSchema = new Schema(
  {
    name: { required: true, type: String, trim: true },
    description: { required: true, type: String },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      required: true,
    },
    publishedDate: { type: Date, default: new Date() },
    appliers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        accepted: { type: Boolean, default: false },
      },
    ],
    requirements: [{ required: true, type: String }],
    nombre: { required: true, type: Number, min: 1, max: 30 },
    valid: { type: Boolean, default: true },
    category: {
      type: String,
      required: true,
      enum: ["internship", "partTime", "fullTime"],
    },
    mode: { type: String, required: true, enum: ["local", "remote"] },
    ConditionScore: { type: Number, required: true },
  },
  { timestamps: true }
);

const Offers = mongoose.model("offer", offerSchema, "offer");
module.exports = Offers;
