const express = require("express");

const courseController = require("../controller/controller.course");
const { authorize, AUTH_ROLES } = require("../middleware/auth");
const { EXPERT, USER } = AUTH_ROLES;
const { upload } = require("../utils/upload");

const route = express.Router();

route.post(
  "/addCourse",
  upload.single("coursePhoto"),
  courseController.addCourse
);

route.put(
  "/uploadImage/:id",
  upload.single("coursePhoto"),
  courseController.uploadPhoto
);

// route.get("/getUserById/:id", courseController.getUserById);

route.post("/addChapter", authorize([EXPERT]), courseController.addChapter);
route.get("/getAllCourses", courseController.getAllCourses);
route.get("/getCourseById/:id", courseController.getCourseById);
route.get("/getCourseByOwnerId", courseController.getCourseByOwnerId);
route.get("/getCourseBySubscribedId", courseController.getCourseBySubscribedId);

route.get("/getChapterById/:id", courseController.getChapterById);

route.put("/applyToCourse/:id", courseController.applyCourse);

route.post(
  "/deleteCourseById",
  authorize([EXPERT]),
  courseController.deleteCourseById
);

route.put(
  "/updateCourseById/:id",
  authorize([EXPERT]),
  courseController.updateCourseById
);

route.get("/getAllOwners", courseController.getAllExpertsOwnersArray);

route.get(
  "/getProgression/:courseId/:userId",
  courseController.getProgressionCourseByUserIdAndCourseId
);
//courseId and userId in pathParam + 1 to increment and -1 to decrement in the body taht typeOfUpdate
route.put(
  "/updateProgression/:courseId/:userId",
  courseController.updateProgressionCourseByUserIdAndCourseId
);

module.exports = route;
