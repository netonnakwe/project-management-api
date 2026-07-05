const prisma = require("../lib/prisma")
const userSelect = require("../constants/userSelect")
const userWithRelationSelect = require("../constants/userWithRelationSelect")
const projectSelect = require("../constants/projectSelect")
const taskSelect = require("../constants/taskSelect")
const { buildPagination } = require("../utils/pagination")

exports.getAllUsers = async (page, limit) => {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where: {
                isActive: true
            },
            skip,
            take: limit,
            select: userSelect
        }),
        prisma.user.count({
            where: {
                isActive: true
            }
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