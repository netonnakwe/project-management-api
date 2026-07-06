const { z } = require("zod");
const { paginationSchema } = require("./paginationValidator");
const ROLES = require("../constants/roles");

const userQuerySchema = paginationSchema.extend({
    role: z.nativeEnum(ROLES).optional(),

    isActive: z
        .enum(["true", "false"])
        .transform(value => value === "true")
        .optional()
});

module.exports = {
    userQuerySchema
};