const prisma = require("../lib/prisma")

exports.getAllTasks = async () => {
    return prisma.task.findMany({
        include: {
            project: true,
            assignee: true
        }
    });
}

exports.getTaskById = async (id) => {
    return prisma.task.findUnique({
        where: {
            id
        },
        include: {
            project: true,
            assignee: true
        }
    })
}

exports.createTask = async (data) => {
    return prisma.task.create({
        data
    });
}

exports.updateTask = async (id, updates) => {
    return prisma.task.update({
        where: {
            id
        },
        data: updates
    });
}

exports.deleteTask = async (id) => {
    return prisma.task.delete({
        where: {
            id
        }
    });
}