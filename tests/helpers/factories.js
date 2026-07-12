const bcrypt = require("bcrypt");
const prisma = require("../../src/lib/prisma");
const ROLES = require("../../src/constants/roles")
const { randomUUID } = require("crypto");
const PROJECT_STATUS = require("../../src/constants/projectStatus");
const TASK_STATUS = require("../../src/constants/taskStatus");
const TASK_PRIORITY = require("../../src/constants/taskPriority")

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

async function createProject(overrides = {}) {
    const {
        owner,
        ownerId,
        ...projectData
    } = overrides;

    const ownerEntity =
        owner ?? (await createProjectManager());

    const finalOwnerId =
        ownerId ?? ownerEntity.id;

    return prisma.project.create({
        data: {
            name: "Test Project",
            description: "Test Description",
            status: PROJECT_STATUS.IN_PROGRESS,

            ownerId: finalOwnerId,

            ...projectData
        }
    });
}

const oneWeekFromNow = () =>
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

async function createTask(overrides = {}) {
    const {
        project,
        assignee,
        projectId,
        assigneeId,
        ...taskData
    } = overrides;

    const projectEntity =
        project ?? (await createProject());

    const assigneeEntity =
        assignee ?? (await createDeveloper());

    const finalProjectId =
        projectId ?? projectEntity.id;

    const finalAssigneeId =
        assigneeId ?? assigneeEntity.id;

    return prisma.task.create({
        data: {
            title: "Test Task",
            description: "Test task description.",
            status: TASK_STATUS.TODO,
            priority: TASK_PRIORITY.MEDIUM,
            dueDate: oneWeekFromNow(),

            projectId: finalProjectId,
            assigneeId: finalAssigneeId,

            ...taskData
        },
        include: {
            project: true,
            assignee: true
        }
    });
}

async function createArchivedProject(overrides = {}) {
    return createProject({
        isArchived: true,
        archivedAt: new Date(),
        ...overrides
    });
}

async function createCompletedTask(overrides = {}) {
    return createTask({
        status: TASK_STATUS.DONE,
        ...overrides
    });
}

async function createArchivedTask(overrides = {}) {
    return createTask({
        isArchived: true,
        archivedAt: new  Date(),
        ...overrides
    });
}

async function createHighPriorityTask(overrides = {}) {
    return createTask({
        priority: TASK_PRIORITY.HIGH,
        ...overrides
    });
}

module.exports = {
    createUser,
    createAdmin,
    createProjectManager,
    createDeveloper,

    createProject,
    createArchivedProject,

    createTask,
    createCompletedTask,
    createArchivedTask,
    createHighPriorityTask
};