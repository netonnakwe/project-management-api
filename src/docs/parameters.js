const parameters = {
    // Generic parameters
    Id: {
        name: "id",
        in: "path",
        required: true,
        description: "Resource ID",
        schema: {
            type: "integer",
            example: 1
        }
    },

    Page: {
        name: "page",
        in: "query",
        schema: {
            type: "integer",
            default: 1
        }
    },

    Limit: {
        name: "limit",
        in: "query",
        schema: {
            type: "integer",
            default: 10
        }
    },

    Search: {
        name: "search",
        in: "query",
        schema: {
            type: "string"
        }
    },

    Order: {
        name: "order",
        in: "query",
        schema: {
            type: "string",
            enum: [
                "asc",
                "desc"
            ]
        }
    },

    // Task parameters

    TaskSortBy: {
    name: "sortBy",
    in: "query",
    description: "Field to sort tasks by.",
    schema: {
        type: "string",
        enum: [
            "title",
            "completed",
            "createdAt",
            "updatedAt"
        ],
        default: "createdAt"
    }
    },

    Completed: {
    name: "completed",
    in: "query",
    description: "Filter tasks by completion status.",
    schema: {
        type: "boolean"
    }
    },

    ProjectId: {
    name: "projectId",
    in: "query",
    description: "Filter tasks by project ID.",
    schema: {
        type: "integer",
        example: 1
    }
    },

    AssigneeId: {
    name: "assigneeId",
    in: "query",
    description: "Filter tasks by assignee ID.",
    schema: {
        type: "integer",
        example: 3
    }
    },

    // Project parameters

    ProjectSortBy: {
    name: "sortBy",
    in: "query",
    description: "Field to sort projects by.",
    schema: {
        type: "string",
        enum: [
            "name",
            "status",
            "createdAt",
            "updatedAt"
        ],
        default: "createdAt"
    }
    },

    Status: {
    name: "status",
    in: "query",
    description: "Filter projects by status.",
    schema: {
        type: "string",
        enum: [
            "PLANNING",
            "IN_PROGRESS",
            "ON_HOLD",
            "COMPLETED"
        ]
    }
    },

    OwnerId: {
    name: "ownerId",
    in: "query",
    description: "Filter projects by owner ID.",
    schema: {
        type: "integer",
        example: 2
    }
    },

    // User parameters

    UserSortBy: {
    name: "sortBy",
    in: "query",
    description: "Field to sort users by.",
    schema: {
        type: "string",
        enum: [
            "firstName",
            "lastName",
            "email",
            "role",
            "createdAt"
        ],
        default: "createdAt"
    }
    },

    Role: {
    name: "role",
    in: "query",
    description: "Filter users by role.",
    schema: {
        type: "string",
        enum: [
            "ADMIN",
            "PROJECT_MANAGER",
            "DEVELOPER"
        ]
    }
    },

    IsActive: {
    name: "isActive",
    in: "query",
    description: "Filter users by active status.",
    schema: {
        type: "boolean"
    }
    },
};

module.exports = {
    parameters
};