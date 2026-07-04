const taskSelect = require("../constants/taskSelect");
const userSelect = require("../constants/userSelect");
const prisma = require("../lib/prisma")

exports.getAllProjects = async () => {
    return prisma.project.findMany({
        include: {
            owner: {
                select: userSelect
            },
            tasks: {
                select: taskSelect
            }
        }
    });
}

exports.getProjectById = async (id) => {
    return prisma.project.findUnique({
        where: {id},
        include: {
            owner: {
                select: userSelect
            },
            tasks: {
                select: taskSelect
            }
        }
    });
}
exports.createProject = async (data) => {
    return prisma.project.create({
        data,
        select: projectSelect
    });
}

exports.updateProject = async (id, updates) => {
    return prisma.project.update({
        where: {id},
        data: updates,
        select: projectSelect
    });
}

exports.deleteProject = async (id) => {
    return prisma.project.delete({
        where: {id},
        select: projectSelect
    });
}