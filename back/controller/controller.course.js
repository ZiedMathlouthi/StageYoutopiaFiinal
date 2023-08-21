const Course = require("../models/courses/model.course");
const Chapter = require("../models/courses/model.chapter");
const UserModel = require("../models/model.user");
const progressionCourseModel = require("../models/courses/model.progressionCourse");
const axios = require("axios");

exports.uploadPhoto = async (req, res) => {
  const idCourse = req.params.id;
  try {
    await Course.findByIdAndUpdate(idCourse, {
      coursePhoto: req.file?.filename,
    })
      .then((result) => {
        return res.status(200).send(result);
      })
      .catch((error) => {
        return res.status(400).send(error);
      });
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.addCourse = async (req, res) => {
  const chaptersData = req.body.courseContent;
  let arrayOfChapters = [];

  const chapterPromises = chaptersData.map((e) => {
    const _chapter = new Chapter(e);
    return _chapter.save();
  });
  try {
    arrayOfChapters = await Promise.all(chapterPromises);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
  const data = {
    courseName: req.body.courseName,
    courseDescription: req.body.courseDescription,
    courseContent: arrayOfChapters,
    courseOwner: req.body.courseOwner,
    courseSubcribed: req.body.courseSubcribed,
    coursePhoto: req.file?.filename,
  };
  const _course = new Course(data);
  _course
    .save()
    .then((createdCourse) => {
      res.status(200).send(createdCourse);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ message: "Failed adding new Course !!!!!!!" });
    });
};

exports.addChapter = async (req, res) => {
  const data = {
    chapterTitle: req.body.chapterTitle,
    chapterParagraphs: req.body.chapterParagraphs,
  };

  const _chapter = new Chapter(data);
  _chapter
    .save()
    .then((createdCourse) => {
      res.status(200).json({ message: "Chapter created successfully...." });
    })
    .catch((err) => {
      res.status(400).json({ message: "Failed adding new Chapter !!!!!!!" });
    });
};

exports.getAllCourses = async (req, res) => {
  try {
    await Course.find({})
      .then((e) => {
        res.status(200).send(e);
      })
      .catch((err) => {
        res
          .status(400)
          .json({
            message: "error while parsing and finding all courses !!!!!",
          });
      });
  } catch (error) {
    res
      .status(400)
      .json({ message: "error while getting the list of courses " });
  }
};

exports.getCourseById = async (req, res) => {
  const id = req.params.id;

  try {
    const courseById = await Course.findById(id)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((error) => {
        res.status(404).json({ message: "Course NOT FOUND" });
      });
  } catch (error) {
    res.status(400).json({ message: "failed getting course by id !!!!" });
  }
};

exports.getChapterById = async (req, res) => {
  const id = req.params.id;

  try {
    const chapterById = await Chapter.findById(id)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((error) => {
        res.status(404).json({ message: "Chapter NOT FOUND !!!!" });
      });
  } catch (error) {
    RES.status(400).json({ message: "Failed getting chapter by Id !!!!!" });
  }
};

exports.getCourseByOwnerId = async (req, res) => {
  const ownerId = req.body.id;

  try {
    await Course.find({ courseOwner: ownerId })
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((error) => {
        res
          .status(404)
          .json({ message: "Course NOT FOUND by Owners ID !!!!!" });
      });
  } catch (error) {
    res
      .status(400)
      .json({ message: "failed getting the course by Owner's ID !!!!!" });
  }
};

exports.getCourseBySubscribedId = async (req, res) => {
  const subscribedId = req.body.id;

  try {
    await Course.find({ courseSubcribed: subscribedId })
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((error) => {
        res
          .status(404)
          .json({ message: "Course NOT FOUND by subscribed Id !!!!!!" });
      });
  } catch (error) {
    res
      .status(400)
      .json({ message: "failed getting the course by Subscribed's ID !!!!!" });
  }
};

exports.applyCourse = async (req, res) => {
  const courseID = req.params.id;
  const userID = req.body.userID;

  Course.findByIdAndUpdate(courseID, { $push: { courseSubcribed: userID } })
    .then((result) => {
      if (result) {
        const progressionData = {
          userId: userID,
          courseId: courseID,
        };
        const _progressionData = new progressionCourseModel(progressionData);
        _progressionData
          .save()
          .then((success) => {
            res
              .status(200)
              .json({
                message: `userID ${userID} is just subscribed to courseID ${courseID}`,
              });
          })
          .catch((error) => {
            res
              .status(400)
              .json({ message: "Failed to initiate the progression" });
          });
      } else {
        res.status(404).json({ message: `courseID ${courseID} NOT FOUND` });
      }
    })
    .catch((error) => {
      res.status(400).json({ message: "Failed Subscribing !!!!!" });
    });
};

exports.getProgressionCourseByUserIdAndCourseId = async (req, res) => {
  courseID = req.params.courseId;
  userID = req.params.userId;
  await progressionCourseModel
    .find({
      userId: userID,
      courseId: courseID,
    })
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((error) => {
      res.status(400).json({ message: `tahche haw l'erruer: ${error}` });
    });
};

exports.updateProgressionCourseByUserIdAndCourseId = async (req, res) => {
  courseID = req.params.courseId;
  userID = req.params.userId;
  incrementOrDecrement = req.body.typeOfUpdate;
  await progressionCourseModel
    .findOneAndUpdate(
      {
        userId: userID,
        courseId: courseID,
      },
      {
        $inc: { chapterProgression: incrementOrDecrement },
      }
    )
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((error) => {
      res
        .status(400)
        .json({
          message: `Error while incrementing/decrementing progression\nError: ${error}`,
        });
    });
};

exports.deleteCourseById = async (req, res) => {
  const id = req.body.id;
  let token = req.header("x-auth-token") || req.headers.authorization;

  if (!token) {
    return res.status(401).send("Access denied. No token provided");
  }
  token = token.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, role } = decoded;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).send("Invalid token.");
    } else {
      const course = await Course.findById(id);
      if (course.courseOwner.toString() === user.id) {
        const deletedCourse = await Course.findByIdAndDelete(course.id);
        return res
          .status(200)
          .json({
            message: `the course : ${deletedCourse}\n deleted successfully `,
          });
      }
      return res.status(401).send("Bruuuuh youre not the owner !!!");
    }
  } catch (ex) {
    if (ex.name === "CastError") {
      return res.status(404).json({ msg: "Course NOT FOUND !!!!!!!" });
    }
    return res.status(400).json({ msg: ex });
  }
};

exports.updateCourseById = async (req, res) => {
  const id = req.params.id;
  const updatedCourseContent = req.body.updatedCourseContent;
  const tokkeeeen = req.header("x-auth-token") || req.headers.authorization;
  const config = {
    headers: { Authorization: `Bearer ${tokkeeeen}` },
  };

  let token = req.header("x-auth-token") || req.headers.authorization;
  if (!token) {
    return res.status(401).send("Access denied. No token provided");
  }
  token = token.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email } = decoded;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).send("Invalid token.");
    } else {
      const course = await Course.findById(id);
      if (course.courseOwner.toString() === user.id) {
        axios
          .post("http://127.0.0.1:9000/courses/addCourse", updatedCourseContent)
          .then((result) => {
            res.status(200).json({ msg: "updated SUCCESSFULLY" });
          })
          .catch((ERROR) => {
            res.status(400).json({ msg: "Error" });
          });
        const updatedCourse = await Course.findByIdAndDelete(id);
      }
    }
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ msg: "Cast Error !!!!!!" });
    }
    return res.status(400).json({ mwerwrwsg: error });
  }
};

exports.getAllExpertsOwnersArray = async (req, res) => {
  let ownersArray = [];
  try {
    const courses = await Course.find({});
    courses.map((course) => {
      const id = course.courseOwner;
      const user = UserModel.findById(id).then((r) => ownersArray.push(r));
    });
  } catch (error) {
    res.status(400).json({ msg: error });
  }
};

// exports.getUserById = async (req, res) => {
//     const idExp = req.params.id;
//     try {
//       await UserModel.findById(idExp).then(
//         (result) => {
//           console.log(result)
//           res.status(200).send(result);
//         }
//       ).catch(
//         (error) => {
//           res.status(404).send(error);
//         }
//       );
//     } catch (error) {
//       res.status(400).json({message: `Error getting user by Id. Error:\n${error}`})
//     }
// }
