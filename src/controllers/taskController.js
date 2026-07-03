const taskService = require("../services/taskService");

exports.getTasks = async (req, res) => {
    const tasks = await taskService.getAllTasks();

    res.status(200).json(tasks);
};

exports.addTask = async (req, res) => {
    const { title, projectId, assigneeId } = req.body;

    if (!title || !projectId || !assigneeId) {
        return res.status(400).json({
            message: "title, projectId and assigneeId are required."
        })
    }

    const task = await taskService.createTask({title, projectId, assigneeId})

    res.status(201).json(task);
};

exports.getSingleTask = async (req, res) => {
    const task = await taskService.getTaskById(req.id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    res.status(200).json(task);
};

exports.updateTask = async (req, res) => {
    const {title, completed} = req.body;

    if (title === undefined && completed === undefined) {
        return res.status(400).json({
            message: "Provide at least one field to update."
        })
    }
    const task = await taskService.updateTask(req.id, {title, completed})

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        })
    }
    res.status(200).json(task);
};

exports.deleteTask = async (req, res) => {
    const deletedTask = await taskService.deleteTask(req.id);

    if (!deletedTask) {
        return res.status(404).json({
            message: "Task not found."
        })
    }

    res.status(204).send()
};