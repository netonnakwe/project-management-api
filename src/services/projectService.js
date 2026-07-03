const prisma = require("../lib/prisma")

exports.getAllProjects = async () => {
    return prisma.project.findMany({
        include: {
            owner: true,
            tasks: true
        }
    });
}

exports.getProjectById = async (id) => {
    return prisma.project.findUnique({
        where: {id},
        include: {
            owner: true,
            tasks: true
        }
    });
}
exports.createProject = async (data) => {
    return prisma.project.create({
        data
    });
}

exports.updateProject = async (id, updates) => {
    return prisma.project.update({
        where: {id},
        data: updates
    });
}

exports.deleteProject = async (id) => {
    return prisma.project.delete({
        where: {id}
    });
}