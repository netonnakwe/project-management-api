const { z } = require("zod");
const PROJECT_STATUS = require("../constants/projectStatus");

const projectSchema = z.object({
    name: z.string().min(1, "Project name is required."),
    description: z.string().min(1, "Description is required."),
    status: z.enum(Object.values(PROJECT_STATUS)),
    ownerId: z.number().int().positive()
});

const createProjectSchema = projectSchema.extend({
    status: z
        .enum(Object.values(PROJECT_STATUS))
        .default(PROJECT_STATUS.IN_PROGRESS)
});

const updateProjectSchema = projectSchema.pick({
            name: true,
            description: true,
            status: true,
            ownerId: true}).partial().refine(
                                            data => data.name !== undefined ||
                                            data.description !== undefined ||
                                            data.status !== undefined ||
                                            data.ownerId !== undefined,
                                        {
                                            message: "Provide at least one field to update."
                                        }
                                    );


module.exports = {
    createProjectSchema,
    updateProjectSchema
};