const responses = {
    BadRequest: {
        description: "Bad Request",
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/ValidationError"
                }
            }
        }
    },

    Unauthorized: {
        description: "Unauthorized",
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/Error"
                }
            }
        }
    },

    Forbidden: {
        description: "Forbidden",
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/Error"
                }
            }
        }
    },

    NotFound: {
        description: "Resource not found",
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/Error"
                }
            }
        }
    },

    Conflict: {
        description: "Conflict",
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/Error"
                }
            }
        }
    },

    InternalServerError: {
        description: "Internal server error",
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/Error"
                }
            }
        }
    }
};

module.exports = {
    responses
};