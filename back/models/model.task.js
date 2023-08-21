const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const taskSchema = new Schema(
  {
    name: { required: true, type: String, trim: true },
    description: { required: true, type: String },
    websiteUrl: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        uri: { type: String },
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      required: true,
    },
    publishedDate: { type: Date, default: new Date() },
    ExpireDate: { type: Date, required: true },
    appliers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        uri: { type: String, default: null },
        accepted: { type: Boolean, default: false },
        Classment: { type: String },
      },
    ],
    requirements: [{ required: true, type: String }],
    nombre: { required: true, type: Number, min: 1, max: 30 },
    score: { type: Number, default: 0 },
    valid: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const tasks = mongoose.model("task", taskSchema, "task");
module.exports = tasks;
