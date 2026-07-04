const express = require("express");

const router = express.Router();

const projectController = require("../controllers/projectController");
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize")
const ROLES = require("../constants/roles")
const validateId = require("../middleware/validateId")
const {createProjectSchema, updateProjectSchema} = require("../validators/projectValidator")
const validate = require("../middleware/validate")

router.use(protect);

router.get("/", authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.DEVELOPER), projectController.getProjects);
router.post("/", authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), validate(createProjectSchema),  projectController.addProject);

router.get("/:id", authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.DEVELOPER), validateId, projectController.getSingleProject);
router.patch("/:id", authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), validateId, validate(updateProjectSchema), projectController.updateProject);
router.delete("/:id", authorize(ROLES.ADMIN), validateId, projectController.deleteProject);

module.exports = router;