const {Prisma} = require("@prisma/client");
const { ZodError} = require("zod");
const jwt = require("jsonwebtoken");
const AppError = require("../errors/AppError")

module.exports = (err, req, res, next) => {

    // Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const field = err.meta?.target?.[0];
        const name = field.charAt(0).toUpperCase() + field.slice(1);
        switch (err.code) {
            case "P2002":
                
                return res.status(409).json({
                    message: `${name} already exists.`
                });
            case "P2003":
                return res.status(400).json({
                    message: "Invalid related resource."
                });
            case "P2025":
                return res.status(404).json({
                    message: `${name} not found.`
                });

            default:
                return res.status(500).json({
                    message: "A database error occurred."
                })
        }
    }

    // Zod validation
    if (err instanceof ZodError) {
        return res.status(400).json({
            errors: err.issues.map(issue => ({
                field: issue.path.join("."),
                message: issue.message
            }))
        });
    }

    // Application errors
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }

    if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
            message: "Invalid token. Please log in again."
        });
    }

    if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
            message: "Token has expired. Please log in again."
        })
    }

    // Fallback for unhandled errors
    if (process.env.NODE_ENV !== "test") {
    console.error(err);
    }
    
    res.status(500).json({
        message: "Something went wrong. Please try again later."
    })
}