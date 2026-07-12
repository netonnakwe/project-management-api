const swaggerJsdoc = require("swagger-jsdoc");
const {schemas} = require("../docs/schemas");
const {responses} = require("../docs/responses");
const {parameters} = require("../docs/parameters");

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "Project Management API",
            version: "1.0.0",
            description:
                "A REST API for managing users, projects and tasks."
        },

        tags: [
      {
        name: "Authentication",
        description: "Authentication endpoints",
      },
      {
        name: "Users",
        description: "User management endpoints",
      },
      {
        name: "Projects",
        description: "Project management endpoints",
      },
      {
        name: "Tasks",
        description: "Task management endpoints",
      },
    ],

        servers: [
            {
                url: process.env.API_URL || "http://localhost:8080",
            }
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            },
            schemas,
            responses,
            parameters
        },

        security: [
            {
                bearerAuth: []
            }
        ]
    },

    apis: [
        "./src/routes/*.js",
        "./src/routes/**/*.js",
    ]
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;