const projectSelect = require("../constants/projectSelect");
const userSelect = require("../constants/userSelect");
const taskSelect = require("../constants/taskSelect")
const prisma = require("../lib/prisma");
const { buildPagination } = require("../utils/pagination");
const ROLES = require("../constants/roles");
const AppError = require("../errors/AppError");

// Helper functions
async function validateProject(projectId) {
    const project = await prisma.project.findUnique({
        where: { id: projectId }
    });

    if (!project) {
        throw new AppError("Project not found.", 404);
    }

    if (project.isArchived) {
        throw new AppError(
            "Cannot add tasks to an archived project.",
            400
        );
    }

    return project;
}

async function validateAssignee(assigneeId) {
    const assignee = await prisma.user.findUnique({
        where: { id: assigneeId }
    });

    if (!assignee) {
        throw new AppError("Assignee not found.", 404);
    }

    if (!assignee.isActive) {
        throw new AppError(
            "Assignee account is inactive.",
            400
        );
    }

    if (assignee.role !== ROLES.DEVELOPER) {
        throw new AppError(
            "Task assignee must be a developer.",
            400
        );
    }

    return assignee;
}

function ensureProjectManagerOwnsProject(user, project) {
    if (
        user.role === ROLES.PROJECT_MANAGER &&
        project.ownerId !== user.id
    ) {
        throw new AppError(
            "You are not allowed to create tasks for this project.",
            403
        );
    }
}

function authorizeTaskAccess(user, task) {
    if (user.role === ROLES.ADMIN) {
        return;
    }

    if (
        user.role === ROLES.PROJECT_MANAGER &&
        task.project.ownerId === user.id
    ) {
        return;
    }

    if (
        user.role === ROLES.DEVELOPER &&
        task.assigneeId === user.id
    ) {
        return;
    }

    throw new AppError("You are not authorized to access this task.", 403);
}

function authorizeTaskUpdate(user, data) {
    if (user.role !== ROLES.DEVELOPER) {
        return;
    }

    const restrictedFields = [
        "title",
        "description",
        "priority",
        "dueDate",
        "assigneeId",
        "projectId"
    ];

    const attemptedRestrictedUpdate =
        restrictedFields.some(field => field in data);

    if (attemptedRestrictedUpdate) {
        throw new AppError(
            "Developers can only update the task status.",
            403
        );
    }
}

function authorizeTaskDeletion(user, task) {
    if (user.role === ROLES.ADMIN) {
        return;
    }

    if (
        user.role === ROLES.PROJECT_MANAGER &&
        task.project.ownerId === user.id
    ) {
        return;
    }

    throw new AppError(
        "You are not authorized to archive this task.",
        403
    );
}

// Service functions

exports.getAllTasks = async (
    user,
    {
        page,
        limit,
        status,
        priority,
        projectId,
        assigneeId,
        search,
        sortBy,
        order
    }
) => {
    const skip = (page - 1) * limit;

    // Authorization filters
    const authWhere = {};

    if (user.role === ROLES.PROJECT_MANAGER) {
        authWhere.project = {
            ownerId: user.id
        };
    } else if (user.role === ROLES.DEVELOPER) {
        authWhere.assigneeId = user.id;
    }

    // Query filters
    const queryWhere = {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(projectId && { projectId }),

        ...(search && {
            OR: [
                {
                    title: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    description: {
                        contains: search,
                        mode: "insensitive"
                    }
                }
            ]
        })
    };

    // Only admins can filter by assignee
    if (user.role === ROLES.ADMIN && assigneeId) {
        queryWhere.assigneeId = assigneeId;
    }

    const where = {
        isArchived: false,
        ...authWhere,
        ...queryWhere
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
            select: taskSelect
        }),
        prisma.task.count({
            where
        })
    ]);

    return {
        data: tasks,
        pagination: buildPagination(page, limit, total)
    };
};

exports.getTaskById = async (id, user) => {
    const task = await prisma.task.findUnique({
        where: {
            id,
            isArchived: false
        },
        select: taskSelect
    });

    if (!task) {
        throw new AppError("Task not found.", 404);
    }

    authorizeTaskAccess(user, task);

    return task;
};

exports.createTask = async (user, data) => {
    const project = await validateProject(data.projectId);

    ensureProjectManagerOwnsProject(user, project);

    await validateAssignee(data.assigneeId);

    return prisma.task.create({
        data,
        select: taskSelect
    });
}

exports.updateTask = async (id, user, data) => {
    await exports.getTaskById(id, user);

    authorizeTaskUpdate(user, data);

    if (data.projectId !== undefined) {
        await validateProject(data.projectId);
    }

    if (data.assigneeId !== undefined) {
        await validateAssignee(data.assigneeId);
    }

    return prisma.task.update({
        where: { id },
        data,
        select: taskSelect
    });
};

exports.deleteTask = async (id, user) => {
    const task = await this.getTaskById(id, user);

    authorizeTaskDeletion(user, task);

    return prisma.task.update({
        where: {id},
        data: {
            isArchived: true,
            archivedAt: new Date()
        }
    });
}