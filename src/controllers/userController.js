const userService = require("../services/userService");
const asyncHandler = require("../middleware/asyncHandler");

exports.getUsers = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
})

exports.addUser = asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body)

    res.status(201).json(user);
})

exports.getSingleUser = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.status(200).json(user)
})

exports.updateUser = asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.id, req.body);

    res.status(200).json(user);
})

exports.deleteUser = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.id);

    res.status(204).send()
})