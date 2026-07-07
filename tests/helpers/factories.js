const bcrypt = require("bcrypt");
const prisma = require("../../src/lib/prisma");
const ROLES = require("../../src/constants/roles")
const { randomUUID } = require("crypto");

async function createUser(overrides = {}) {
    const password = await bcrypt.hash("Password123", 10);

    const user = prisma.user.create({
        data: {
            firstName: "John",
            lastName: "Doe",
            email: `john-${randomUUID()}@example.com`,
            password,
            role: ROLES.DEVELOPER,
            ...overrides
        }
    });

    return user;
}

async function createAdmin(overrides = {}) {
    return createUser({
        role: ROLES.ADMIN,
        ...overrides
    });
}

async function createProjectManager(overrides = {}) {
    return createUser({
        role: ROLES.PROJECT_MANAGER,
        ...overrides
    });
}

async function createDeveloper(overrides = {}) {
    return createUser({
        role: ROLES.DEVELOPER,
        ...overrides
    });
}

const PROJECT_STATUS = require("../../src/constants/projectStatus");

async function createProject(overrides = {}) {
    const owner =
        overrides.owner ??
        (await createProjectManager());

    return prisma.project.create({
        data: {
            name: "Test Project",
            description: "Test Description",
            status: PROJECT_STATUS.IN_PROGRESS,
            ownerId: owner.id,
            ...overrides
        }
    });
}

async function createTask(overrides = {}) {
    const project =
        overrides.project ??
        (await createProject());

    const assignee =
        overrides.assignee ??
        (await createDeveloper());

    return prisma.task.create({
        data: {
            title: "Implement login",
            completed: false,
            projectId: project.id,
            assigneeId: assignee.id,
            ...overrides
        }
    });
}

module.exports = {
    createUser,
    createAdmin,
    createProjectManager,
    createDeveloper,
    createProject,
    createTask
};