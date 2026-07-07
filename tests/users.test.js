const request = require("supertest");
const app = require("../src/app");

const prisma = require("../src/lib/prisma");
const { cleanDatabase } = require("./helpers/db");
const { createAdmin, createProjectManager, createDeveloper } = require("./helpers/factories");
const { authenticate } = require("./helpers/auth");

const bcrypt = require("bcrypt");
const ROLES = require("../src/constants/roles");

beforeEach(async () => {
    await cleanDatabase();
});

afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
});

describe("Users", () => {
    describe("GET /users", () => {

        it("should return all users", async () => {

        await createAdmin();
        await createProjectManager();
        await createDeveloper();

        const { token } = await authenticate({
            role: ROLES.ADMIN
        });

        const response = await request(app)
            .get("/users")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);

        expect(response.body.data).toHaveLength(4);

        });

    // Pagination
        it("should paginate users", async () => {

    for (let i = 0; i < 15; i++) {
        await createDeveloper();
    }

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .get("/users?page=2&limit=5")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toHaveLength(5);

    expect(response.body.pagination.page).toBe(2);

    expect(response.body.pagination.limit).toBe(5);

        });

    // Filtering
        it("should filter users by role", async () => {

    await createAdmin();
    await createDeveloper();
    await createDeveloper();

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .get("/users?role=DEVELOPER")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    response.body.data.forEach(user => {
        expect(user.role).toBe("DEVELOPER");
    });

        });

        it("should filter active users", async () => {

    await createDeveloper({
        isActive: true
    });

    await createDeveloper({
        isActive: false
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .get("/users?isActive=true")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    response.body.data.forEach(user => {
        expect(user.isActive).toBe(true);
    });

        });

    // Search
        it("should search users by first name", async () => {
    await createDeveloper({
        firstName: "Alice"
    });

    await createDeveloper({
        firstName: "Bob"
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .get("/users?search=Ali")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].firstName).toBe("Alice");
        });

        it("should search users by last name", async () => {
    await createDeveloper({
        lastName: "Johnson"
    });

    await createDeveloper({
        lastName: "Smith"
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .get("/users?search=Smith")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data[0].lastName).toBe("Smith");
        });

        it("should search users by email", async () => {
    await createDeveloper({
        email: "alice@example.com"
    });

    await createDeveloper({
        email: "bob@example.com"
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .get("/users?search=alice")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].email).toBe("alice@example.com");
        });

        it("should perform case-insensitive searches", async () => {
    await createDeveloper({
        firstName: "Alice"
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .get("/users?search=ALICE")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toHaveLength(1);
        });

        it("should return an empty array when no users match the search", async () => {
    await createDeveloper({
        firstName: "Alice"
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .get("/users?search=Michael")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toEqual([]);
        });

    // Sorting
        it("should sort users by first name in ascending order", async () => {
    await createDeveloper({ firstName: "Charlie" });
    await createDeveloper({ firstName: "Alice" });
    await createDeveloper({ firstName: "Bob" });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .get("/users?sortBy=firstName&order=asc")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    const names = response.body.data.map(user => user.firstName);

    expect(names).toEqual([...names].sort());
        });

        it("should sort users by first name in descending order", async () => {
    await createDeveloper({ firstName: "Charlie" });
    await createDeveloper({ firstName: "Alice" });
    await createDeveloper({ firstName: "Bob" });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .get("/users?sortBy=firstName&order=desc")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    const names = response.body.data.map(user => user.firstName);

    expect(names).toEqual([...names].sort().reverse());
        });

        it("should sort users by createdAt in ascending order", async () => {
    await createDeveloper({ firstName: "First" });
    await createDeveloper({ firstName: "Second" });
    await createDeveloper({ firstName: "Third" });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .get("/users?sortBy=createdAt&order=asc")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    const dates = response.body.data.map(user =>
        new Date(user.createdAt).getTime()
    );

    expect(dates).toEqual([...dates].sort((a, b) => a - b));
        });

        it("should reject an invalid sort field", async () => {
    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .get("/users?sortBy=salary")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
        });

        it("should reject an invalid sort order", async () => {
    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .get("/users?order=up")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
        });

    });

    describe("GET /users/:id", () => {
        it("should return a user by id", async () => {
        const user = await createDeveloper({
            firstName: "Alice"
        });

        const { token } = await authenticate({
            role: ROLES.ADMIN
        });

        const response = await request(app)
            .get(`/users/${user.id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);

        expect(response.body).toEqual(
            expect.objectContaining({
                id: user.id,
                firstName: "Alice",
                email: user.email,
                role: user.role
            })
        );

        expect(response.body.password).toBeUndefined();
        });

        it("should return 404 when the user does not exist", async () => {
    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .get("/users/999999")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
        });

        it("should reject an invalid user id", async () => {
    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .get("/users/abc")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
        });

        it("should reject requests without authentication", async () => {
    const user = await createDeveloper();

    const response = await request(app)
        .get(`/users/${user.id}`);

    expect(response.status).toBe(401);
        });

        it("should reject unauthorized users", async () => {
    const user = await createDeveloper();

    const { token } = await authenticate({
        role: ROLES.DEVELOPER
    });

    const response = await request(app)
        .get(`/users/${user.id}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
        });


    });

    describe("PATCH /users/:id", () => {
        it("should update the user's first name", async () => {
        const user = await createDeveloper({
            firstName: "John"
        });

        const { token } = await authenticate({
            role: ROLES.ADMIN
        });

        const response = await request(app)
            .patch(`/users/${user.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                firstName: "Jane"
            });

        expect(response.status).toBe(200);

        expect(response.body.firstName).toBe("Jane");

        const updatedUser = await prisma.user.findUnique({
            where: {
                id: user.id
            }
        });

        expect(updatedUser.firstName).toBe("Jane");
        });

        it("should update multiple user fields", async () => {
    const user = await createDeveloper();

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch(`/users/${user.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            firstName: "Alice",
            lastName: "Johnson"
        });

    expect(response.status).toBe(200);

    expect(response.body).toEqual(
        expect.objectContaining({
            firstName: "Alice",
            lastName: "Johnson"
        })
    );
        });

        it("should update the user's role", async () => {
    const user = await createDeveloper();

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch(`/users/${user.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            role: ROLES.PROJECT_MANAGER
        });

    expect(response.status).toBe(200);

    expect(response.body.role).toBe(ROLES.PROJECT_MANAGER);
        });

        it("should deactivate a user", async () => {
    const user = await createDeveloper({
        isActive: true
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch(`/users/${user.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            isActive: false
        });

    expect(response.status).toBe(200);

    expect(response.body.isActive).toBe(false);
        });

        it("should reject duplicate email addresses", async () => {
    const existingUser = await createDeveloper({
        email: "existing@example.com"
    });

    const user = await createDeveloper();

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch(`/users/${user.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            email: existingUser.email
        });

    expect(response.status).toBe(409);

    expect(response.body).toEqual({
        message: "Email already exists."
    });
        });

        it("should return 404 for a non-existent user", async () => {
    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch("/users/999999")
        .set("Authorization", `Bearer ${token}`)
        .send({
            firstName: "Jane"
        });

    expect(response.status).toBe(404);
        });

        it("should reject an empty update request", async () => {
    const user = await createDeveloper();

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch(`/users/${user.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({});

    expect(response.status).toBe(400);
        });

        it("should reject an invalid role", async () => {
    const user = await createDeveloper();

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch(`/users/${user.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            role: "CEO"
        });

    expect(response.status).toBe(400);
        });

        it("should reject unauthorized users", async () => {
    const user = await createDeveloper();

    const { token } = await authenticate({
        role: ROLES.DEVELOPER
    });

    const response = await request(app)
        .patch(`/users/${user.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            firstName: "Jane"
        });

    expect(response.status).toBe(403);
        });

        it("should reject unauthenticated requests", async () => {
    const user = await createDeveloper();

    const response = await request(app)
        .patch(`/users/${user.id}`)
        .send({
            firstName: "Jane"
        });

    expect(response.status).toBe(401);
        });
    });

    describe("DELETE /users/:id", () => {
        it("should deactivate a user", async () => {
    const user = await createDeveloper({
        isActive: true
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .delete(`/users/${user.id}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);

    const updatedUser = await prisma.user.findUnique({
        where: {
            id: user.id
        }
    });

    expect(updatedUser.isActive).toBe(false);
        });

        it("should return 404 when the user does not exist", async () => {
    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .delete("/users/999999")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
        });

        it("should reject deactivating an inactive user", async () => {
    const user = await createDeveloper({
        isActive: false
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .delete(`/users/${user.id}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
        });

        it("should reject non-admin users", async () => {
    const user = await createDeveloper();

    const { token } = await authenticate({
        role: ROLES.DEVELOPER
    });

    const response = await request(app)
        .delete(`/users/${user.id}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
        });

        it("should reject unauthenticated requests", async () => {
    const user = await createDeveloper();

    const response = await request(app)
        .delete(`/users/${user.id}`);

    expect(response.status).toBe(401);
        });

    });

    describe("PATCH /users/:id/activate", () => {
        it("should activate an inactive user", async () => {
    const user = await createDeveloper({
        isActive: false
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch(`/users/${user.id}/activate`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toEqual(
    expect.objectContaining({
        message: "Account activated successfully."
    })
);

    expect(response.body.user.isActive).toBe(true);

    const updatedUser = await prisma.user.findUnique({
        where: {
            id: user.id
        }
    });

    expect(updatedUser.isActive).toBe(true);
        });

        it("should return 404 when the user does not exist", async () => {
    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch("/users/999999/activate")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
        });

        it("should return 200 when the user is already active", async () => {
    const user = await createDeveloper({
        isActive: true
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch(`/users/${user.id}/activate`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toEqual(
    expect.objectContaining({
        message: "Account activated successfully."
    })
);

expect(response.body.user.isActive).toBe(true);
        });

        it("should reject non-admin users", async () => {
    const user = await createDeveloper({
        isActive: false
    });

    const { token } = await authenticate({
        role: ROLES.DEVELOPER
    });

    const response = await request(app)
        .patch(`/users/${user.id}/activate`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
        });

        it("should reject unauthenticated requests", async () => {
    const user = await createDeveloper({
        isActive: false
    });

    const response = await request(app)
        .patch(`/users/${user.id}/activate`);

    expect(response.status).toBe(401);
        });
});
})