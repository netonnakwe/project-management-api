const asyncHandler = require("../middleware/asyncHandler");
const authService = require("../services/authService");

exports.register = asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    res.status(201).json(user);
})

exports.login = async (req, res) => {
    const result = await authService.login(req.body);
    
    res.status(200).json(result);
}

exports.me = async (req, res) => {
    res.status(200).json(req.user)
}