const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");
const validateId = require("../middleware/validateId")

router.get("/", userController.getUsers);
router.post("/", userController.addUser);

router.get("/:id", validateId, userController.getSingleUser);
router.put("/:id", validateId, userController.updateUser);
router.delete("/:id", validateId, userController.deleteUser);

module.exports = router;