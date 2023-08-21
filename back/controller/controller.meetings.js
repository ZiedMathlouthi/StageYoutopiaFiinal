const Meeting = require("../models/model.meeting");
const User = require("../models/model.user");
const Offres = require("../models/model.offre");
const Company = require("../models/model.company");
const { sendMeetingEmail } = require("../utils/mail");
const moment = require("moment");
axios = require("axios");
const properties = {
  enable_prejoin_ui: true,
  enable_chat: true,
  lang: "en",
  enable_new_call_ui: true,
  enable_emoji_reactions: true,
};
const api = axios.create({
  baseURL: process.env.DAILY_URL,
  headers: { Authorization: `Bearer ${process.env.DAILY_KEY}` },
});
exports.createRoom = async (req, res) => {
  console.log(req.params);
  try {
    const { offerId, invited } = req.params;
    console.log(invited);
    console.log("offerId", offerId);
    const offer = await Offres.findById(offerId).lean().exec();
    console.log("offer", offer);
    const ownerUser = await Company.findById(offer.owner);
    console.log(ownerUser);
    const invitedUser = await User.findById(invited);
    console.log(invitedUser);
    const startDateTime = moment(req.body.startDateTime, "YYYY-MM-DD HH:mm:ss");
    console.log(startDateTime);
    console.log(moment(startDateTime).format("YYYY-MM-DD"));
    const expiresTime =
      moment(startDateTime).format("YYYY-MM-DD") +
      "T" +
      req.body.expiresTime +
      ":00.000Z";
    console.log(expiresTime);
    // startDateTime.add(moment.duration(1, "hours"));
    // (
    //   moment(startDateTime).format("YYYY-MM-DD") +
    //   "T" +
    //   req.body.expiresTime +
    //   ":00.000Z"
    // ).unix();
    const expire = moment(expiresTime, "YYYY-MM-DD HH:mm:ss");
    console.log(expire.valueOf());
    const response = await api.post("/rooms", {
      properties: {
        ...properties,
        nbf: startDateTime.unix(),
        exp: expire.unix(),
      },
    });
    const url = response.data.url;
    console.log("url", response.data.url);
    const newMeetings = new Meeting({
      owner: offer.owner,
      name: `${offer.name}  ${invitedUser.fullName}`,
      url: url,
      invited: req.params.invited,
      startDateTime: req.body.startDateTime,
      expiresTime: expire.valueOf(),
    });
    await newMeetings.save();
    sendMeetingEmail(ownerUser, invitedUser, offer);
    return res.status(201).json(newMeetings);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
exports.getMeetingInvited = async (req, res) => {
  try {
    const mettings = await Meeting.find({ invited: req.params.id });
    return res.status(200).json(mettings);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
exports.getMeetingOwner = async (req, res) => {
  try {
    const meetings = await Meeting.find({ owner: req.params.id });
    return res.status(200).json(meetings);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
exports.getRooms = async (req, res) => {
  try {
    const { data: room } = await api.get("/");
    return res.status(200).json(room);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
