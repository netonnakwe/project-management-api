const taskService = require("../services/taskService");
const asyncHandler = require("../middleware/asyncHandler")

exports.getTasks = asyncHandler(async (req, res) => {
    const tasks = await taskService.getAllTasks();

    res.status(200).json(tasks);
});

exports.addTask = asyncHandler(async (req, res) => {
    const { title, projectId, assigneeId } = req.body;

    if (!title || !projectId || !assigneeId) {
        return res.status(400).json({
            message: "title, projectId and assigneeId are required."
        })
    }

    const task = await taskService.createTask({title, projectId, assigneeId})

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
    const {title, completed} = req.body;

    if (title === undefined && completed === undefined) {
        return res.status(400).json({
            message: "Provide at least one field to update."
        })
    }

     const updates = {};

    if (title !== undefined) updates.title = title;
    if (completed !== undefined) updates.completed = completed;

    const task = await taskService.updateTask(req.id, updates)

    res.status(200).json(task);
});

exports.deleteTask = asyncHandler(async (req, res) => {
    await taskService.deleteTask(req.id);

    res.status(204).send()
});