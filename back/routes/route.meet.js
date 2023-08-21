const express = require("express");
const router = express.Router();
const meetingController = require("../controller/controller.meetings");
router.post("/:offerId/:invited", meetingController.createRoom);
router.get("/invited/:id", meetingController.getMeetingInvited);
router.get("/owner/:id", meetingController.getMeetingOwner);
// Create a new meeting

module.exports = router;
