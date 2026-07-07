const request = require("supertest");
const app = require("../../src/app");
const { createUser } = require("./factories");

async function authenticate(options = {}) {
    let user;

    if (options.user) {
        // Use an existing user
        user = options.user;
    } else {
        // Create a new user
        user = await createUser(options);
    }

    const response = await request(app)
        .post("/auth/login")
        .send({
            email: user.email,
            password: "Password123"
        });

    return {
        user,
        token: response.body.token
    };
}

module.exports = {
    authenticate
};