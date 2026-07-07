const {z} = require("zod");
const roles = require("../constants/roles");

const registerSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required."),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters."),
    role: z.enum(Object.values(roles))
});

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required.")
})

module.exports = {
    registerSchema,
    loginSchema
}