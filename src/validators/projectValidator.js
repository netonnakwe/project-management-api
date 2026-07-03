const { z } = require("zod");
const PROJECT_STATUS = require("../constants/projectStatus");

const projectSchema = z.object({
    name: z.string().min(1, "Project name is required."),
    description: z.string().min(1, "Description is required."),
    status: z.enum(Object.values(PROJECT_STATUS)).default(PROJECT_STATUS.IN_PROGRESS),
    ownerId: z.number().int().positive()
});

const createProjectSchema = projectSchema.pick({
    name: true,
    description: true,
    ownerId: true,
    status: true
});

const updateProjectSchema = projectSchema.pick({
    name: true,
    description: true,
    status: true
}).partial().refine(
    data => Object.keys(data).length > 0,
    {
        message: "Provide at least one field to update."
    }
);



module.exports = {
    createProjectSchema,
    updateProjectSchema
};