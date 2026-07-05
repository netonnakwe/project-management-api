const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const userSelect = require("../constants/userSelect");

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication required."
        })
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = jwt.verify(
            token, process.env.JWT_SECRET
        );

        const user = await prisma.user.findUnique({
            where: {
                id: payload.userId
            },
            select: userSelect
        })

        if (!user) {
            return res.status(401).json({
                message: "Authentication required."
            })
        }

        if (!user.isActive) {
            return res.status(401).json({
                message: "Your account has been deactivated. Please contact an admin."
            })
        }
        const { password, ...safeUser } = user;
        req.user = safeUser;

        next();
    } catch (error) {
        next(error);
    }
}
