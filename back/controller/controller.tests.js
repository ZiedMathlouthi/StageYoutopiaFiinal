const questionModel = require("../models/tests/model.question");
const testModel = require("../models/tests/model.tests");
const UserModel = require("../models/model.user");
const axios = require("axios");

exports.addTest = async (req, res) => {
  const questionsData = req.body.listOfQuestions;
  let questionsArray = [];
  const questionsPromises = questionsData.map((e) => {
    const _question = new questionModel(e);
    return _question.save();
  });
  try {
    questionsArray = await Promise.all(questionsPromises);
  } catch (error) {
    res.status(400).json(error);
    console.log(error);
  }

  const data = {
    testTitle: req.body.testTitle,
    testDescription: req.body.testDescription,
    listOfQuestions: questionsArray,
    testPhoto: req.body.testPhoto,
    testOwner: req.body.testOwner,
    testTimer: req.body.testTimer,
  };

  const _test = new testModel(data);
  _test
    .save()
    .then((createdTest) => {
      res.status(200).json({ message: "successs !!!!" });
    })
    .catch((error) => {
      res.status(400).json(error);
      console.log(error);
    });
};

exports.getAllTestsObject = async (req, res) => {
  try {
    await testModel
      .find({})
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((error) => {
        res.status(400).json(error);
        console.log(error);
      });
  } catch (error) {
    res.status(400).json(error);
    console.log(error);
  }
};

exports.getAllTestsData = async (req, res) => {
  try {
    const testsObjectArrayPromises = await testModel.find({}).then((result) => {
      return result;
    });
    const testsObjectArray = await Promise.all(testsObjectArrayPromises);
    const questionsIdsArray = testsObjectArray.map((test) => {
      return test.listOfQuestions;
    });
    const questionDataPromises = questionsIdsArray.map(async (question) => {
      const sb = question.map(async (id) => {
        const Promises = await questionModel
          .findById(id)
          .then((res) => {
            return res;
          })
          .catch((error) => res.status(404).json({ message: "e" }));
        return Promises;
      });
      const sbData = await Promise.all(sb);
      return sbData;
    });
    const questionsArray = await Promise.all(questionDataPromises);

    const data = testsObjectArray.map((test, index) => {
      test.listOfQuestions = questionsArray[index];
      return test;
    });
    res.status(200).send(data);
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.getTestObjectById = async (req, res) => {
  id = req.params.id;
  try {
    const testObject = await testModel
      .findById(id)
      .then((result) => {
        return result;
      })
      .catch((error) =>
        res.status(400).json({ message: "Error while finding a test" + error })
      );
    res.status(200).send(testObject);
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.getTestDataById = async (req, res) => {
  id = req.params.id;
  try {
    const testObjectById = await testModel
      .findById(id)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        res.status(400).json({ message: "Error while getting test by Id" });
      });
    const questionsIdsArray = testObjectById.listOfQuestions;
    const sb = questionsIdsArray.map(async (questionId) => {
      const Promises = await questionModel
        .findById(questionId)
        .then((res) => {
          return res;
        })
        .catch((error) => res.status(400).json({ message: "Error" + error }));
      return Promises;
    });
    const sbData = await Promise.all(sb);
    let testDataById = testObjectById;
    testDataById.listOfQuestions = sbData;
    res.status(200).send(testDataById);
  } catch (error) {
    res.status(400).json({ message: "Error while getting a test by Id" });
  }
};

exports.updateTestById = async (req, res) => {
  const id = req.params.id;
  let updatedTestContent = req.body.updatedTest;
  const questionsData = updatedTestContent.listOfQuestions;
  let questionsArray = [];

  const tokkeeeeen = req.header("x-auth-token") || req.headers.authorization;
  const config = {
    headers: { Authorization: `Bearer ${tokkeeeeen}` },
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
      const test = await testModel.findById(id);
      if (test.testOwner.toString() === user.id) {
        const questionsPromises = questionsData.map((e) => {
          const _question = new questionModel(e);
          return _question.save();
        });
        try {
          questionsArray = await Promise.all(questionsPromises);
        } catch (error) {
          res
            .status(400)
            .json({ message: "error adding different questions " + error });
          console.log(error);
        }

        updatedTestContent.listOfQuestions = questionsArray;
        console.log(updatedTestContent);
        await testModel
          .findByIdAndUpdate(id, updatedTestContent)
          .then((RES) => res.status(200).send("success"))
          .catch((error) => {
            console.log(error);
            return res.status(408).send(error);
          });

        // axios.post("http://localhost:9000/tests/addTest", updatedTestContent)
        // .then((result) => {
        //     return res.status(200).json({ message: "Updated SUCCESSFULLY" });
        // }).catch((error) => {
        //     return res.status(400).json({ message: "Error while catching" })
        // });
        // const updatedTest = await testModel.findByIdAndDelete(id);
      }
    }
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ msg: "Cast Error !!!!!!" });
    }
    return res.status(400).send(error);
  }
};

exports.applyTestById = async (req, res) => {
  const testID = req.params.id;
  const userID = req.body.userID;

  testModel
    .findByIdAndUpdate(testID, { $push: { listOfSubcribed: userID } })
    .then((result) => {
      if (result) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send(result);
      }
    })
    .catch((error) => {
      return res.status(400).send(error);
    });
};
