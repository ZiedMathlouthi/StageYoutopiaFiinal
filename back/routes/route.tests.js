const express = require('express');

const testsController = require('../controller/controller.tests');
const { authorize, AUTH_ROLES } = require("../middleware/auth");
const { EXPERT, USER } = AUTH_ROLES;

const route = express.Router();

route.post('/addTest', testsController.addTest);

route.get("/getAllTestObject", testsController.getAllTestsObject);
route.get("/getAllTestData", testsController.getAllTestsData);
route.get("/getTestObjectById/:id", testsController.getTestObjectById);
route.get("/getTestDataById/:id", testsController.getTestDataById);

route.put("/updateTestById/:id", testsController.updateTestById);

route.put("/applyUserById/:id", testsController.applyTestById)

module.exports = route;