const prisma = require("../lib/prisma")
const userSelect = require("../constants/userSelect")
const userWithRelationSelect = require("../constants/userWithRelationSelect")
const projectSelect = require("../constants/projectSelect")
const taskSelect = require("../constants/taskSelect")

exports.getAllUsers = async () => {
    return prisma.user.findMany({
        select: userSelect
    });
}

exports.getUserById = async (id) => {
    return prisma.user.findUnique({
        where: {id},
        select: userWithRelationSelect
    });
}

exports.updateUser = async (id, updates) => {
    return prisma.user.update({
        where: {id},
        data: updates,
        select: userSelect
    });
}

exports.deleteUser = async (id) => {
    return prisma.user.delete({
        where: {id},
        select: userSelect
    });
}