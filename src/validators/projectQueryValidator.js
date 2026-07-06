const { z } = require("zod");
const { paginationSchema } = require("./paginationValidator");
const PROJECT_STATUS = require("../constants/projectStatus");

const projectQuerySchema = paginationSchema.extend({
    status: z.nativeEnum(PROJECT_STATUS).optional(),

    ownerId: z.coerce.number().int().positive().optional()
});

module.exports = {
    projectQuerySchema
};