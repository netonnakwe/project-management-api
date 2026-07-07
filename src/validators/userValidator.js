const { z } = require("zod");
const roles = require("../constants/roles");

const userSchema = z.object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    email: z.string().email("Invalid email address"),
    role: z.enum(Object.values(roles)),
    isActive: z.boolean()
});

const updateUserSchema = userSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    role: true,
    isActive: true
}).partial().refine(
    data => Object.keys(data).length > 0,
    {
        message: "Provide at least one field to update."
    }
);



module.exports = {
    updateUserSchema
};