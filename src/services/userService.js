const prisma = require("../lib/prisma")

exports.getAllUsers = async () => {
    return prisma.user.findMany({
        include: {
            projects: true,
            tasks: true
        }
    });
}

exports.getUserById = async (id) => {
    return prisma.user.findUnique({
        where: {id},
        include: {
            projects: true,
            tasks: true
        }
    });
}

exports.createUser = async (data) => {
    return prisma.user.create({
        data
    });
}

exports.updateUser = async (id, updates) => {
    return prisma.user.update({
        where: {id},
        data: updates
    });
}

exports.deleteUser = async (id) => {
    return prisma.user.delete({
        where: {id}
    });
}