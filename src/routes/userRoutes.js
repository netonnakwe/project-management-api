const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");
const validateId = require("../middleware/validateId")
const {createUserSchema, updateUserSchema} = require("../validators/userValidator");
const validate = require("../middleware/validate")

router.get("/", userController.getUsers);
router.post("/", validate(createUserSchema), userController.addUser);

router.get("/:id", validateId, userController.getSingleUser);
router.put("/:id", validateId, validate(updateUserSchema), userController.updateUser);
router.delete("/:id", validateId, userController.deleteUser);

module.exports = router;