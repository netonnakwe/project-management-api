const {Prisma} = require("@prisma/client");
const { ZodError} = require("zod");
const jwt = require("jsonwebtoken");

module.exports = (err, req, res, next) => {
    console.error(err)

    // Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002":
                return res.status(409).json({
                    message: "A record with this value already exists."
                });
            case "P2003":
                return res.status(400).json({
                    message: "Invalid related resource."
                });
            case "P2025":
                return res.status(404).json({
                    message: "Resource not found."
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
    res.status(500).json({
        message: "Something went wrong. Please try again later."
    })
}