const taskService = require("../services/taskService");
const asyncHandler = require("../middleware/asyncHandler")

exports.getTasks = asyncHandler(async (req, res) => {
    
    const { page, limit } = req.validated.query;

    const result = await taskService.getAllTasks(page, limit);

    res.status(200).json(result);
});

exports.addTask = asyncHandler(async (req, res) => {
    const task = await taskService.createTask(req.body)

    res.status(201).json(task);
});

exports.getSingleTask = asyncHandler(async (req, res) => {
    const task = await taskService.getTaskById(req.id);

    if (!task) {
    return res.status(404).json({
        message: "Task not found"
    })
}

    res.status(200).json(task);
});

exports.updateTask = asyncHandler(async (req, res) => {
    const task = await taskService.updateTask(req.id, req.body)

    res.status(200).json(task);
});

exports.deleteTask = asyncHandler(async (req, res) => {
    await taskService.deleteTask(req.id);

    res.status(204).send()
});