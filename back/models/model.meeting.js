const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const meetingSchema = new Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "company" },
  invited: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  name: { type: String, required: true },
  url: { type: String },
  // token: { type: String },
  offer: { type: mongoose.Schema.Types.ObjectId, ref: "offer" },
  startDateTime: { type: Date, required: true },
  expires: {
    type: Date,
    required: true,
    default: Date.now() + 1000 * 60 * 60 * 26,
    expires: function () {
      return this.expiresTime;
    },
  },
  expiresTime: { type: Number },
});
const Meeting = mongoose.model("meeting", meetingSchema, "meeting");
module.exports = Meeting;
