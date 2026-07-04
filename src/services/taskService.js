const projectSelect = require("../constants/projectSelect");
const userSelect = require("../constants/userSelect");
const prisma = require("../lib/prisma")

exports.getAllTasks = async () => {
    return prisma.task.findMany({
        include: {
            project: {
                select: projectSelect
            },
            assignee: {
                select: userSelect
            }
        }
    });
}

exports.getTaskById = async (id) => {
    return prisma.task.findUnique({
        where: {
            id
        },
        include: {
            project: {
                select: projectSelect
            },
            assignee: {
                select: userSelect
            }
        }
    })
}

exports.createTask = async (data) => {
    return prisma.task.create({
        data,
        select: taskSelect
    });
}

exports.updateTask = async (id, updates) => {
    return prisma.task.update({
        where: {
            id
        },
        data: updates,
        select: taskSelect
    });
}

exports.deleteTask = async (id) => {
    return prisma.task.delete({
        where: {
            id
        },
        select: taskSelect
    });
}