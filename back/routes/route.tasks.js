var express = require("express");
const tasks = require("../models/model.task");
const Users = require("../models/model.user");
const { authorize, AUTH_ROLES } = require("../middleware/auth");
const { USER, COMPANY } = AUTH_ROLES;
var router = express.Router();
const { verifyOwners } = require("../middleware/verifyOwners");
const validate = require("../middleware/schemaValidation");
const { verifyDoc: verifyDoc } = require("../middleware/verfieDocument");
const { taskValidator, taskSearch } = require("../validators/validators.tasks");
const {
  addtask,
  updatetask,
  deletetask,
  applytask,
  getAppliers,
  unapplytask,
  acceptApplier,
  unacceptApplier,

  validtask,
  invalidtask,
  getAlltasks,
  searchtasks,
  getCompanyTask,
  updateURI,
  getOneTask,
} = require("../controller/controller.tasks");
router.delete(
  "/:taskId",
  authorize(COMPANY),
  verifyOwners("taskId", tasks),
  deletetask("taskId")
);
router.post("/", authorize(COMPANY), validate(taskValidator), addtask);
router.put(
  "/update/:taskId",
  authorize(COMPANY),
  verifyOwners("taskId", tasks),
  validate(taskValidator),
  updatetask("taskId")
);
router.put(
  "/updateuri/:taskId/",
  // authorize(USER),
  verifyDoc(tasks, "taskId"),
  updateURI("taskId")
);
router.put(
  "/valid/:taskId",
  authorize(COMPANY),
  verifyOwners("taskId", tasks),
  validtask("taskId")
);
router.put(
  "/invalid/:taskId",
  authorize(COMPANY),
  verifyOwners("taskId", tasks),
  invalidtask("taskId")
);
router.put(
  "/apply/:taskId/:userId",
  // authorize(USER),
  verifyDoc(tasks, "taskId"),
  applytask("taskId", "userId")
);
router.put(
  "/unapply/:taskId/:userId",
  // authorize(USER),
  verifyDoc(tasks, "taskId"),
  unapplytask("taskId", "userId")
);
router.get(
  "/appliers/:taskId",
  verifyDoc(tasks, "taskId"),
  getAppliers("taskId")
);
router.put(
  "/accept/:taskId/:userId",
  authorize(COMPANY),
  verifyOwners("taskId", tasks),
  verifyDoc(Users, "userId"),
  acceptApplier("taskId", "userId")
);

router.put(
  "/unaccept/:taskId/:userId",
  authorize(COMPANY),
  verifyOwners("taskId", tasks),
  verifyDoc(Users, "userId"),
  unacceptApplier("taskId", "userId")
);
router.get("/company", authorize(COMPANY), getCompanyTask);
router.get("/all", getAlltasks);
router.get("/oneTask/:taskId", getOneTask);
router.put("/search", validate(taskSearch), searchtasks);
module.exports = router;
