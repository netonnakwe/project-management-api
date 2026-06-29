const prisma = require("../lib/prisma")

exports.getAllTasks = async () => {
    return await prisma.task.findMany();
}

exports.getTaskById = async (id) => {
    return await prisma.task.findUnique({
        where: {
            id
        }
    })
}

exports.createTask = async (data) => {
    return await prisma.task.create({
        data: {
            title: data.title,
            projectId: data.projectId,
            assigneeId: data.assigneeId
        }
    });
}

exports.updateTask = async (id, updates) => {
    const task = exports.getTaskById(id);

    if (!task) {
        return false;
    }

    return await prisma.task.update({
        where: {
            id
        }, 
        data: updates
    });
}

exports.deleteTask = async (id) => {
    const task = exports.getTaskById(id);

    if (!task) {
        return false;
    }

    return await prisma.task.delete({
        where: {
            id
        }
    });
}