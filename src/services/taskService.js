const projectSelect = require("../constants/projectSelect");
const userSelect = require("../constants/userSelect");
const prisma = require("../lib/prisma");
const { buildPagination } = require("../utils/pagination");

exports.getAllTasks = async ({
    page,
    limit,
    completed,
    projectId,
    assigneeId,
    search,
    sortBy,
    order
}) => {
    const skip = (page - 1) * limit;
    const where = {
    ...(completed !== undefined && { completed }),
    ...(projectId && { projectId }),
    ...(assigneeId && { assigneeId }),
    ...(search && {
        title: {
            contains: search,
            mode: "insensitive"
        }
    })
};
    const orderBy = {
    [sortBy]: order
};
    const [tasks, total] = await Promise.all([
        prisma.task.findMany({
        skip,
        take: limit,
        where,
        orderBy,
        include: {
            project: {
                select: projectSelect
            },
            assignee: {
                select: userSelect
            }
        }
    }), 
    prisma.task.count({
        where
    })
    ])

    return {
        data: tasks,
        pagination: buildPagination(page, limit, total)
    }
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