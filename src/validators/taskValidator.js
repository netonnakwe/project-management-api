const { z } = require("zod");
const TASK_STATUS = require("../constants/taskStatus");
const TASK_PRIORITY = require("../constants/taskPriority");

const taskSchema = z.object({
    title: z.string().trim().min(1, "Title is required."),
    description: z.string().trim().min(1, "Description is required."),
    projectId: z.number().int().positive(),
    assigneeId: z.number().int().positive(),
    status: z.enum(TASK_STATUS),
    priority: z.enum(TASK_PRIORITY),
    dueDate: z.coerce.date()
})

const createTaskSchema = taskSchema.pick({
    title: true,
    description: true,
    projectId: true,
    assigneeId: true
});

const updateTaskSchema = taskSchema
    .partial()
    .refine(
        data => Object.keys(data).length > 0,
        {
            message: "Provide at least one field to update."
        }
    );



module.exports = {
    createTaskSchema,
    updateTaskSchema
};