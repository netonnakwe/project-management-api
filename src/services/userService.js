const prisma = require("../lib/prisma")
const userSelect = require("../constants/userSelect")
const userWithRelationSelect = require("../constants/userWithRelationSelect")
const projectSelect = require("../constants/projectSelect")
const taskSelect = require("../constants/taskSelect")
const { buildPagination } = require("../utils/pagination")

exports.getAllUsers = async ({
    page,
    limit,
    role,
    isActive,
    search,
    sortBy,
    order
}) => {
    const skip = (page - 1) * limit;

    const orderBy = {
    [sortBy]: order
};

    const where = {
    ...(role && { role }),
    ...(isActive !== undefined && { isActive }),
    ...(search && {
        OR: [
            {
                firstName: {
                    contains: search,
                    mode: "insensitive"
                }
            },
            {
                lastName: {
                    contains: search,
                    mode: "insensitive"
                }
            },
            {
                email: {
                    contains: search,
                    mode: "insensitive"
                }
            }
        ]
    })
};
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            select: userSelect
        }),
        prisma.user.count({
            where
        })
    ])
    return {
        data: users,
        pagination: buildPagination(page, limit, total)
    }
}

exports.getUserById = async (id) => {
    return prisma.user.findUnique({
        where: { id },
        select: userWithRelationSelect
    });
}

exports.updateUser = async (id, updates) => {
    return prisma.user.update({
        where: {
            id,
            isActive: true
        },
        data: updates,
        select: userSelect
    });
}

exports.deactivateUser = async (id) => {
    return prisma.user.update({
        where: { id },
        data: {
            isActive: false
        },
        select: userSelect
    });
}

exports.activateUser = async (id) => {
    return prisma.user.update({
        where: { id },
        data: {
            isActive: true
        },
        select: userSelect
    });
}