const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");
const protect = require("../middleware/protect")
const authorize = require("../middleware/authorize");
const validateId = require("../middleware/validateId")
const {createUserSchema, updateUserSchema} = require("../validators/userValidator");
const validate = require("../middleware/validate")
const ROLES = require("../constants/roles");

router.use(protect);

router.get("/", authorize(ROLES.ADMIN), userController.getUsers);
router.post("/", authorize(ROLES.ADMIN), validate(createUserSchema), userController.addUser);

router.get("/:id", authorize(ROLES.ADMIN), validateId, userController.getSingleUser);
router.patch("/:id", authorize(ROLES.ADMIN), validateId, validate(updateUserSchema), userController.updateUser);
router.delete("/:id", authorize(ROLES.ADMIN), validateId, userController.deleteUser);

module.exports = router;