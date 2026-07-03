const express = require("express");

const router = express.Router();

const taskController = require("../controllers/taskController");
const validateId = require("../middleware/validateId")
const validate = require("../middleware/validate")

const {createTaskSchema, updateTaskSchema} = require("../validators/taskValidator")

router.get("/", taskController.getTasks);
router.post("/", validate(createTaskSchema), taskController.addTask);

router.get("/:id", validateId, taskController.getSingleTask);
router.put("/:id", validateId, validate(updateTaskSchema), taskController.updateTask);
router.delete("/:id", validateId, taskController.deleteTask);

module.exports = router;