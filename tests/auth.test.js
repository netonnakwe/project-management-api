const request = require("supertest");
const app = require("../src/app");

const prisma = require("../src/lib/prisma");
const { cleanDatabase } = require("./helpers/db");
const { createUser } = require("./helpers/factories");
const { authenticate } = require("./helpers/auth");

const bcrypt = require("bcrypt");

beforeEach(async () => {
    await cleanDatabase();
});

afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
});

describe("POST /auth/register", () => {

    it("should register a new user", async () => {

        const response = await request(app)
            .post("/auth/register")
            .send({
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com",
                password: "Password123",
                role: "ADMIN"
            });

        expect(response.statusCode).toBe(201);

        const user = await prisma.user.findUnique({
    where: {
        email: "john@example.com"
    }
});

        expect(user).not.toBeNull();

        expect(
        await bcrypt.compare(
        "Password123",
        user.password
        )
        ).toBe(true);

        expect(user.password).not.toBe("Password123");

        expect(response.body.password).toBeUndefined();
        });

    it("should reject duplicate email", async () => {
    const user = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "Password123",
        role: "ADMIN"
    };

    await request(app)
        .post("/auth/register")
        .send(user);

    const response = await request(app)
        .post("/auth/register")
        .send(user);

    expect(response.status).toBe(409);

    expect(response.body).toEqual({
        message: "Email already exists."
    });
        });

    it("should reject missing first name", async () => {
    const response = await request(app)
        .post("/auth/register")
        .send({
            lastName: "Doe",
            email: "john@example.com",
            password: "Password123",
            role: "ADMIN"
        });

    expect(response.status).toBe(400);
        });
    
    it("should reject missing last name", async () => {
    const response = await request(app)
        .post("/auth/register")
        .send({
            firstName: "John",
            email: "john@example.com",
            password: "Password123",
            role: "ADMIN"
        });

    expect(response.status).toBe(400);
        });

    it("should reject invalid email", async () => {
    const response = await request(app)
        .post("/auth/register")
        .send({
            firstName: "John",
            lastName: "Doe",
            email: "invalid-email",
            password: "Password123",
            role: "ADMIN"
        });

    expect(response.status).toBe(400);
        });

    it("should reject short password", async () => {
    const response = await request(app)
        .post("/auth/register")
        .send({
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            password: "123",
            role: "ADMIN"
        });

    expect(response.status).toBe(400);
        });

    it("should reject invalid role", async () => {
    const response = await request(app)
        .post("/auth/register")
        .send({
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            password: "Password123",
            role: "CEO"
        });

    expect(response.status).toBe(400);
        });
    
});

describe("POST /auth/login", () => {
    it("should login successfully", async () => {
    await createUser({
        email: "john@example.com"
    });

    const response = await request(app)
        .post("/auth/login")
        .send({
            email: "john@example.com",
            password: "Password123"
        });

    expect(response.status).toBe(200);

    expect(response.body).toEqual(
        expect.objectContaining({
            token: expect.any(String)
        })
    );
        });
    
    it("should reject unknown email", async () => {
    const response = await request(app)
        .post("/auth/login")
        .send({
            email: "unknown@example.com",
            password: "Password123"
        });
    expect(response.status).toBe(401);
        });

    it("should reject incorrect password", async () => {
    await createUser({
        email: "john@example.com"
    });

    const response = await request(app)
        .post("/auth/login")
        .send({
            email: "john@example.com",
            password: "WrongPassword123"
        });

    expect(response.status).toBe(401);
        });

    it("should reject inactive users", async () => {
    await createUser({
        email: "john@example.com",
        isActive: false
    });

    const response = await request(app)
        .post("/auth/login")
        .send({
            email: "john@example.com",
            password: "Password123"
        });

    expect(response.status).toBe(401);
        });

    it("should reject missing email", async () => {
    const response = await request(app)
        .post("/auth/login")
        .send({
            password: "Password123"
        });

    expect(response.status).toBe(400);
        });

    it("should reject missing password", async () => {
    const response = await request(app)
        .post("/auth/login")
        .send({
            email: "john@example.com"
        });

    expect(response.status).toBe(400);
});
});

describe("GET /auth/profile", () => {

    it("should return the authenticated user", async () => {

        const { token, user } = await authenticate();

        const response = await request(app)
            .get("/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);

        expect(response.body).toEqual(
            expect.objectContaining({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            })
        );

        expect(response.body.password).toBeUndefined();

    });

    it("should reject requests without a token", async () => {

        const response = await request(app)
            .get("/auth/me");

        expect(response.status).toBe(401);

    });

    it("should reject invalid tokens", async () => {

        const response = await request(app)
            .get("/auth/me")
            .set("Authorization", "Bearer invalid-token");

        expect(response.status).toBe(401);

    });

});