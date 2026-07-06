const { z } = require("zod");
const { paginationSchema } = require("./paginationValidator");
const PROJECT_STATUS = require("../constants/projectStatus");

const projectQuerySchema = paginationSchema.extend({
    status: z.nativeEnum(PROJECT_STATUS).optional(),

    ownerId: z.coerce.number().int().positive().optional(),

    search: z.string().trim().min(1).optional(),

    sortBy: z
    .enum([
        "name",
        "status",
        "createdAt",
        "updatedAt"
    ])
    .default("createdAt"),

order: z
    .enum(["asc", "desc"])
    .default("desc")
});

module.exports = {
    projectQuerySchema
};