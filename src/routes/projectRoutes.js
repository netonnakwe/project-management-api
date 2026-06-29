const express = require("express");

const router = express.Router();

const projectController = require("../controllers/projectController");
const validateId = require("../middleware/validateId")

router.get("/", projectController.getProjects);
router.post("/", projectController.addProject);

router.get("/:id", validateId, projectController.getSingleProject);
router.put("/:id", validateId, projectController.updateProject);
router.delete("/:id", validateId, projectController.deleteProject);

module.exports = router;