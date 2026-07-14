# Project Management API

A RESTful Project Management API built with **Node.js**, **Express**, **Prisma ORM**, and **PostgreSQL**. The API provides secure authentication, role-based access control, project and task management, and comprehensive automated testing.

## Features

### Authentication

* JWT-based authentication
* Secure password hashing with bcrypt
* Protected routes
* Role-based authorization

### User Roles

* **Admin**

  * Full access to all resources
* **Project Manager**

  * Manage projects they own
  * Manage tasks within their projects
* **Developer**

  * View assigned projects and tasks
  * Update permitted task fields

### Projects

* Create projects
* Retrieve projects
* Update projects
* Soft delete projects
* Pagination
* Filtering
* Searching
* Sorting
* Row-level authorization

### Tasks

* Create tasks
* Retrieve tasks
* Update tasks
* Soft delete tasks
* Assign tasks to developers
* Pagination
* Filtering
* Searching
* Sorting
* Row-level authorization

### Validation

* Request validation using Zod
* Query parameter validation
* Route parameter validation
* Business rule validation
* Consistent API error responses

### Testing

* Jest
* Supertest
* Factory helpers
* Authentication helpers
* Integration tests
* Authorization tests
* Validation tests
* Business rule tests

---

# Tech Stack

* Node.js
* Express.js
* PostgreSQL
* Prisma ORM
* Zod
* JSON Web Token (JWT)
* bcrypt
* Jest
* Supertest

---

# Project Structure

```text
project-management-api/
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── app.js
│   └── server.js
│
├── tests/
│   ├── helpers/
│   ├── auth.test.js
│   ├── projects.test.js
│   └── tasks.test.js
│
├── package.json
└── README.md
```

---

# Getting Started

## Important Links

* Live API URL: https://project-management-api-b38m.onrender.com
* Swagger URL: https://project-management-api-b38m.onrender.com/api-docs/#/

## Prerequisites

* Node.js 20+
* PostgreSQL
* npm

---

## Installation

Clone the repository:

```bash
git clone https://github.com/<your-username>/project-management-api.git
```

Navigate into the project:

```bash
cd project-management-api
```

Install dependencies:

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL=postgresql://username:password@localhost:5432/project_management
JWT_SECRET=your_jwt_secret
PORT=3000
NODE_ENV=development
```

---

# Database Setup

Generate the Prisma client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

(Optional) Seed the database:

```bash
npx prisma db seed
```

---

# Running the Application

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

The API will be available at:

```text
http://localhost:8080
```

---

# Running Tests

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage:

```bash
npm run test:coverage
```

---

# Authentication

Authenticate using the login endpoint.

```
POST /auth/login
```

Successful authentication returns a JWT.

Include the token in subsequent requests:

```http
Authorization: Bearer <your_token>
```

---

# API Endpoints

## Authentication

| Method | Endpoint         | Description         |
| ------ | ---------------- | ------------------- |
| POST   | `/auth/register` | Register a new user |
| POST   | `/auth/login`    | Authenticate a user |

---

## Projects

| Method | Endpoint        | Description           |
| ------ | --------------- | --------------------- |
| POST   | `/projects`     | Create a project      |
| GET    | `/projects`     | Retrieve all projects |
| GET    | `/projects/:id` | Retrieve a project    |
| PATCH  | `/projects/:id` | Update a project      |
| DELETE | `/projects/:id` | Archive a project     |

---

## Tasks

| Method | Endpoint     | Description        |
| ------ | ------------ | ------------------ |
| POST   | `/tasks`     | Create a task      |
| GET    | `/tasks`     | Retrieve all tasks |
| GET    | `/tasks/:id` | Retrieve a task    |
| PATCH  | `/tasks/:id` | Update a task      |
| DELETE | `/tasks/:id` | Archive a task     |

---

# Authorization Model

## Admin

* Full access to all resources.
* Can create, update, and archive any project or task.

## Project Manager

* Can manage projects they own.
* Can manage tasks belonging to their projects.
* Cannot access another manager's projects or tasks.

## Developer

* Can view assigned tasks.
* Can update only permitted task fields.
* Cannot archive tasks.

---

# Pagination

List endpoints support pagination.

Example:

```
GET /tasks?page=1&limit=10
```

---

# Filtering

Example:

```
GET /tasks?status=TODO
GET /tasks?priority=HIGH
GET /projects?status=IN_PROGRESS
```

---

# Searching

Example:

```
GET /tasks?search=authentication
GET /projects?search=mobile
```

---

# Sorting

Example:

```
GET /tasks?sortBy=createdAt&order=desc
```

---

# Error Responses

Example:

```json
{
  "message": "Task not found."
}
```

Validation errors return HTTP `400`, unauthorized requests return `401` or `403`, and missing resources return `404`.

---

# Deployment

This API is designed to be deployed on Render using PostgreSQL.

Typical deployment steps:

1. Create a PostgreSQL database.
2. Configure environment variables.
3. Run Prisma migrations during deployment.
4. Start the Express server.

---

# Future Improvements

* Comments on tasks
* File attachments
* Notifications
* Activity logs
* Dashboard analytics
* Email notifications
* OpenAPI/Swagger documentation
* Rate limiting
* Refresh tokens
* Docker support
* CI/CD pipeline

---

# License

This project is licensed under the MIT License.

