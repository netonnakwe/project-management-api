const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");
const protect = require("../middleware/protect")
const authorize = require("../middleware/authorize");
const validateId = require("../middleware/validateId")
const {updateUserSchema} = require("../validators/userValidator");
const validate = require("../middleware/validate")
const ROLES = require("../constants/roles");
const { paginationSchema } = require("../validators/paginationValidator");

router.use(protect);

router.get("/", authorize(ROLES.ADMIN), validate(paginationSchema, "query"), userController.getUsers);

router.get("/:id", authorize(ROLES.ADMIN), validateId, userController.getSingleUser);
router.patch("/:id", authorize(ROLES.ADMIN), validateId, validate(updateUserSchema), userController.updateUser);
router.patch("/:id/activate", authorize(ROLES.ADMIN), validateId, userController.activateUser);
router.delete("/:id", authorize(ROLES.ADMIN), validateId, userController.deactivateUser);

module.exports = router;