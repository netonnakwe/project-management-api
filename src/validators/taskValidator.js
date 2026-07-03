const { z } = require("zod");

const taskSchema = z.object({
    title: z.string().min(1, "Title is required."),
    projectId: z.number().int().positive(),
    assigneeId: z.number().int().positive(),
    completed: z.boolean()
})

const createTaskSchema = taskSchema.pick({
    title: true,
    projectId: true,
    assigneeId: true
});

const updateTaskSchema = taskSchema.pick({
    title: true,
    completed: true
}).partial().refine(
    data => Object.keys(data).length > 0,
    {
        message: "Provide at least one field to update."
    }
);



module.exports = {
    createTaskSchema,
    updateTaskSchema
};