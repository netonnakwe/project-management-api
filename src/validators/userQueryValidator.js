const { z } = require("zod");
const { paginationSchema } = require("./paginationValidator");
const ROLES = require("../constants/roles");

const userQuerySchema = paginationSchema.extend({
    role: z.nativeEnum(ROLES).optional(),

    isActive: z
        .enum(["true", "false"])
        .transform(value => value === "true")
        .optional(),
    
    search: z.string().trim().min(1).optional(),

    sortBy: z
    .enum([
        "firstName",
        "lastName",
        "email",
        "role",
        "createdAt"
    ])
    .default("createdAt"),

order: z
    .enum(["asc", "desc"])
    .default("desc")
});

module.exports = {
    userQuerySchema
};