const schemas = {
    User: {
        type: "object",
        properties: {
            id: {
                type: "integer",
                example: 1
            },
            firstName: {
                type: "string",
                example: "John"
            },
            lastName: {
                type: "string",
                example: "Doe"
            },
            email: {
                type: "string",
                format: "email",
                example: "john@example.com"
            },
            role: {
                type: "string",
                enum: [
                    "ADMIN",
                    "PROJECT_MANAGER",
                    "DEVELOPER"
                ],
                example: "PROJECT_MANAGER"
            },
            isActive: {
                type: "boolean",
                example: true
            },
            createdAt: {
                type: "string",
                format: "date-time"
            }
        }
    },
    Project: {
    type: "object",
    properties: {
        id: {
            type: "integer",
            example: 1
        },
        name: {
            type: "string",
            example: "Project Management API"
        },
        description: {
            type: "string",
            example: "Backend built with Express and Prisma."
        },
        status: {
            type: "string",
            enum: [
                "PLANNING",
                "IN_PROGRESS",
                "ON_HOLD",
                "COMPLETED"
            ],
            example: "IN_PROGRESS"
        },
        createdAt: {
            type: "string",
            format: "date-time"
        },
        updatedAt: {
            type: "string",
            format: "date-time"
        }
    }
    },
    Task: {
    type: "object",
    properties: {
        id: {
            type: "integer",
            example: 1
        },
        title: {
            type: "string",
            example: "Implement JWT authentication"
        },
        completed: {
            type: "boolean",
            example: false
        },
        createdAt: {
            type: "string",
            format: "date-time"
        },
        updatedAt: {
            type: "string",
            format: "date-time"
        }
    }
    },
    Pagination: {
    type: "object",
    properties: {
        page: {
            type: "integer",
            example: 1
        },
        limit: {
            type: "integer",
            example: 10
        },
        total: {
            type: "integer",
            example: 57
        },
        totalPages: {
            type: "integer",
            example: 6
        }
    }
    },
    Error: {
    type: "object",
    properties: {
        message: {
            type: "string",
            example: "Resource not found."
        }
    }
    },
    ValidationError: {
    type: "object",
    properties: {
        errors: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    field: {
                        type: "string",
                        example: "email"
                    },
                    message: {
                        type: "string",
                        example: "Invalid email address."
                    }
                }
            }
        }
    }
    },
    ProjectWithRelations: {
    allOf: [
        {
            $ref: "#/components/schemas/Project"
        },
        {
            type: "object",
            properties: {
                owner: {
                    $ref: "#/components/schemas/User"
                },
                tasks: {
                    type: "array",
                    items: {
                        $ref: "#/components/schemas/Task"
                    }
                }
            }
        }
    ]
    },
    TaskWithRelations: {
    allOf: [
        {
            $ref: "#/components/schemas/Task"
        },
        {
            type: "object",
            properties: {
                project: {
                    $ref: "#/components/schemas/Project"
                },
                assignee: {
                    $ref: "#/components/schemas/User"
                }
            }
        }
    ]
    },
    RegisterRequest: {
    type: "object",
    required: [
        "firstName",
        "lastName",
        "email",
        "password",
        "role"
    ],
    properties: {
        firstName: {
            type: "string",
            example: "John"
        },
        lastName: {
            type: "string",
            example: "Doe"
        },
        email: {
            type: "string",
            format: "email",
            example: "john@example.com"
        },
        password: {
            type: "string",
            format: "password",
            example: "Password123"
        },
        role: {
            type: "string",
            enum: [
                "ADMIN",
                "PROJECT_MANAGER",
                "DEVELOPER"
            ],
            example: "DEVELOPER"
        }
    }
    },
    LoginRequest: {
    type: "object",
    required: [
        "email",
        "password"
    ],
    properties: {
        email: {
            type: "string",
            format: "email",
            example: "admin@example.com"
        },
        password: {
            type: "string",
            format: "password",
            example: "Password123"
        }
    }
    },
    CreateProjectRequest: {
    type: "object",
    required: [
        "name",
        "description",
        "status",
        "ownerId"
    ],
    properties: {
        name: {
            type: "string",
            example: "Project Management API"
        },
        description: {
            type: "string",
            example: "Backend API built with Express and Prisma."
        },
        status: {
            type: "string",
            enum: [
                "PLANNING",
                "IN_PROGRESS",
                "ON_HOLD",
                "COMPLETED"
            ],
            example: "IN_PROGRESS"
        },
        ownerId: {
            type: "integer",
            example: 2
        }
    }
    },
    UpdateProjectRequest: {
    type: "object",
    description: "Provide at least one field to update.",
    properties: {
        name: {
            type: "string",
            example: "Project Management API v2"
        },
        description: {
            type: "string",
            example: "Updated project description."
        },
        status: {
            type: "string",
            enum: [
                "PLANNING",
                "IN_PROGRESS",
                "ON_HOLD",
                "COMPLETED"
            ],
            example: "COMPLETED"
        }
    },
    minProperties: 1
    },
    CreateTaskRequest: {
    type: "object",
    required: [
        "title",
        "projectId",
        "assigneeId"
    ],
    properties: {
        title: {
            type: "string",
            example: "Implement JWT authentication"
        },
        projectId: {
            type: "integer",
            example: 1
        },
        assigneeId: {
            type: "integer",
            example: 3
        }
    }
    },
    UpdateTaskRequest: {
    type: "object",
    description: "Provide at least one field to update.",
    minProperties: 1,
    properties: {
        title: {
            type: "string",
            example: "Implement RBAC"
        },
        completed: {
            type: "boolean",
            example: true
        }
    }
    },
    UpdateUserRequest: {
    type: "object",
    description: "Provide at least one field to update.",
    minProperties: 1,
    properties: {
        firstName: {
            type: "string",
            example: "John"
        },
        lastName: {
            type: "string",
            example: "Doe"
        },
        email: {
            type: "string",
            format: "email",
            example: "john@example.com"
        },
        role: {
            type: "string",
            enum: [
                "ADMIN",
                "PROJECT_MANAGER",
                "DEVELOPER"
            ],
            example: "PROJECT_MANAGER"
        },
        isActive: {
            type: "boolean",
            example: true
        }
    }
    },
    LoginResponse: {
    type: "object",
    properties: {
        token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        },
        user: {
            $ref: "#/components/schemas/User"
        }
    }
    },
    PaginatedProjectsResponse: {
    type: "object",
    properties: {
        data: {
            type: "array",
            items: {
                $ref: "#/components/schemas/ProjectWithRelations"
            }
        },
        pagination: {
            $ref: "#/components/schemas/Pagination"
        }
    }
    },
    PaginatedTasksResponse: {
    type: "object",
    properties: {
        data: {
            type: "array",
            items: {
                $ref: "#/components/schemas/TaskWithRelations"
            }
        },
        pagination: {
            $ref: "#/components/schemas/Pagination"
        }
    }
    },
    PaginatedUsersResponse: {
    type: "object",
    properties: {
        data: {
            type: "array",
            items: {
                $ref: "#/components/schemas/User"
            }
        },
        pagination: {
            $ref: "#/components/schemas/Pagination"
        }
    }
    },
};

module.exports = {
    schemas
};