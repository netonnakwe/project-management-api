const prisma = require("@prisma/client");
const { PrismaClientKnownRequestError } = require("@prisma/client/runtime/client");

module.exports = (err, req, res, next) => {
    console.error(err);

    if (err instanceof PrismaClientKnownRequestError) {
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

    res.status(500).json({
        message: "Something went wrong. Please try again later."
    })
}