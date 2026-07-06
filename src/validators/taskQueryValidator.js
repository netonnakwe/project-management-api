const { z } = require("zod");
const { paginationSchema } = require("./paginationValidator");

const taskQuerySchema = paginationSchema.extend({
    completed: z
        .enum(["true", "false"])
        .transform(value => value === "true")
        .optional(),

    projectId: z.coerce.number().int().positive().optional(),
    assigneeId: z.coerce.number().int().positive().optional(),

    search: z.string().trim().min(1).optional()
});