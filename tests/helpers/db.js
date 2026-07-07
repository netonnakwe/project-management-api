const prisma = require("../../src/lib/prisma");

async function cleanDatabase() {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
}

module.exports = {
    cleanDatabase
};