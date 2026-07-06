const taskSelect = require("../constants/taskSelect");
const userSelect = require("../constants/userSelect");
const prisma = require("../lib/prisma");
const { buildPagination } = require("../utils/pagination");

exports.getAllProjects = async (page, limit) => {
    const skip = (page - 1) * limit;
    const where = {
    ...(status && { status }),
    ...(ownerId && { ownerId })
};
    
    const [projects, total] = await Promise.all([
        prisma.project.findMany({
            skip,
            take: limit,
            where,
            include: {
                owner: {
                    select: userSelect
                },
                tasks: {
                    select: taskSelect
                }
            }
        }),
        prisma.project.count()
    ])
        
    return {
        data: projects,
        pagination: buildPagination(page, limit, total)
    }
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