const { z } = require("zod");
const { paginationSchema } = require("./paginationValidator");
const TASK_STATUS = require("../constants/taskStatus");
const TASK_PRIORITY = require("../constants/taskPriority");

const taskQuerySchema = paginationSchema.extend({
    status: z
        .enum(Object.values(TASK_STATUS))
        .optional(),

    priority: z
        .enum(Object.values(TASK_PRIORITY))
        .optional(),

    projectId: z
        .coerce
        .number()
        .int()
        .positive()
        .optional(),

    assigneeId: z
        .coerce
        .number()
        .int()
        .positive()
        .optional(),

    search: z
        .string()
        .trim()
        .min(1)
        .optional(),

    sortBy: z
        .enum([
            "title",
            "status",
            "priority",
            "dueDate",
            "createdAt",
            "updatedAt"
        ])
        .default("createdAt"),

    order: z
        .enum(["asc", "desc"])
        .default("desc")
});

module.exports = {
    taskQuerySchema
};

module.exports = {
    taskQuerySchema
};