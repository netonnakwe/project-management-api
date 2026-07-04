const jwt = require("jsonwebtoken");

exports.generateToken = (user) => {
    return jwt.sign(
        {
        userId: user.id,
        email: user.email,
        role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        })
}