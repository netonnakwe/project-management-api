const taskService = require("../services/taskService");
const asyncHandler = require("../middleware/asyncHandler")

exports.getTasks = asyncHandler(async (req, res) => {

    const result = await taskService.getAllTasks(req.user, req.validated.query);
    res.status(200).json(result);
});

exports.addTask = asyncHandler(async (req, res) => {
    const task = await taskService.createTask(req.user, req.body)

    res.status(201).json(task);
});

exports.getSingleTask = asyncHandler(async (req, res) => {
    const task = await taskService.getTaskById(req.id, req.user);

    if (!task) {
    return res.status(404).json({
        message: "Task not found"
    })
}

    res.status(200).json(task);
});

exports.updateTask = asyncHandler(async (req, res) => {
    const task = await taskService.updateTask(req.id, req.user, req.validated.body)

    res.status(200).json(task);
});

exports.deleteTask = asyncHandler(async (req, res) => {
    await taskService.deleteTask(req.id, req.user);

    res.status(204).send()
});