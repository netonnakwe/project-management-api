const taskService = require("../services/taskService");

exports.getTasks = async (req, res) => {
    const tasks = await taskService.getAllTasks();

    res.status(200).json(tasks);
};

exports.addTask = async (req, res) => {
    const { title, projectId, assigneeId } = req.body;

    if (!title) {
        return res.status(400).json({
            message: "Please provide a title for this task."
        })
    }

    const task = await taskService.createTask({title, projectId, assigneeId})

    res.status(201).json(task);
};

exports.getSingleTask = (req, res) => {
    const task = taskService.getTaskById(req.id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    res.status(200).json(task);
};

exports.updateTask = (req, res) => {
    const task = taskService.updateTask(req.id, req.body)

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        })
    }
    res.status(200).json(task);
};

exports.deleteTask = (req, res) => {
    const isDeleted = taskService.deleteTask(req.id);

    if (!isDeleted) {
        return res.status(404).json({
            message: "Task not found."
        })
    }

    res.status(204).send()
};