const express = require("express");

const router = express.Router();

const taskController = require("../controllers/taskController");
const validateId = require("../middleware/validateId")
const validate = require("../middleware/validate")
const { paginationSchema } = require("../validators/paginationValidator");

const {createTaskSchema, updateTaskSchema} = require("../validators/taskValidator");
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const ROLES = require("../constants/roles");

router.use(protect);

router.get("/", authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.DEVELOPER), validate(paginationSchema, "query"), taskController.getTasks);
router.post("/", authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), validate(createTaskSchema), taskController.addTask);

router.get("/:id", authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.DEVELOPER), validateId, taskController.getSingleTask);
router.patch("/:id", authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.DEVELOPER), validateId, validate(updateTaskSchema), taskController.updateTask);
router.delete("/:id", authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), validateId, taskController.deleteTask);

module.exports = router;