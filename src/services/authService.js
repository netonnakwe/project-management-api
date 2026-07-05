const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const {generateToken} = require("../utils/jwt");

exports.register = async (data) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: data.email
        }
    });

    if (existingUser) {
        throw new Error("Email already exists.");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: hashedPassword,
            role: data.role
        }
    });

    const {password, ...safeUser} = user;

    return safeUser;
}

exports.login = async (data) => {
    const user = await prisma.user.findUnique({
        where: {
            email: data.email
        }
    });

    if (!user || !user.isActive) {
        throw new AppError("Invalid email or password.", 401);
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password);

    if (!passwordMatches) {
        throw new Error("Invalid email or password.");
    }

    const token = generateToken(user);

    const {password, ...safeUser} = user;

    return {
        user: safeUser,
        token
    };
}