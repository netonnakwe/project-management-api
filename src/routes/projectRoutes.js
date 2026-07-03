const express = require("express");

const router = express.Router();

const projectController = require("../controllers/projectController");
const validateId = require("../middleware/validateId")
const {createProjectSchema, updateProjectSchema} = require("../validators/projectValidator")
const validate = require("../middleware/validate")

router.get("/", projectController.getProjects);
router.post("/", validate(createProjectSchema),  projectController.addProject);

router.get("/:id", validateId, projectController.getSingleProject);
router.put("/:id", validateId, validate(updateProjectSchema), projectController.updateProject);
router.delete("/:id", validateId, projectController.deleteProject);

module.exports = router;