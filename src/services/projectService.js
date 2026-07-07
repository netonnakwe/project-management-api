const projectSelect = require("../constants/projectSelect");
const taskSelect = require("../constants/taskSelect");
const userSelect = require("../constants/userSelect");
const prisma = require("../lib/prisma");
const { buildPagination } = require("../utils/pagination");
const AppError = require("../errors/AppError");
const ROLES = require("../constants/roles");

exports.getAllProjects = async ( user, {
    page,
    limit,
    status,
    ownerId,
    search,
    sortBy,
    order
}) => {
    const skip = (page - 1) * limit;

    const authWhere = {};

    if (user.role === ROLES.PROJECT_MANAGER) {
       authWhere.ownerId = user.id;
    } else if (user.role === ROLES.DEVELOPER) {
       authWhere.tasks = {
        some: {
            assigneeId: user.id
        }
        };
    }

    const queryWhere = {
        ...(status && { status }),
        ...(search && {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
               {
                    description: {
                        contains: search,
                        mode: "insensitive"
                }
            }
        ]
    })
};

    if (user.role === ROLES.ADMIN && ownerId) {
    queryWhere.ownerId = ownerId;
}


const where = {
    ...authWhere,
    ...queryWhere
};

    const orderBy = {
    [sortBy]: order
};
    
    const [projects, total] = await Promise.all([
        prisma.project.findMany({
            skip,
            take: limit,
            where,
            orderBy,
            include: {
                owner: {
                    select: userSelect
                },
                tasks: {
                    select: taskSelect
                }
            }
        }),
        prisma.project.count()
    ])
        
    return {
        data: projects,
        pagination: buildPagination(page, limit, total)
    }
}

exports.getProjectById = async (id) => {
    return prisma.project.findUnique({
        where: {id},
        include: {
            owner: {
                select: userSelect
            },
            tasks: {
                select: taskSelect
            }
        }
    });
}

exports.createProject = async (data) => {
    const owner = await prisma.user.findUnique({
        where: {
            id: data.ownerId
        }
    });

    if (!owner) {
        throw new AppError("Owner not found.", 404);
    }

    if (!owner.isActive) {
        throw new AppError("Owner must be active.", 400);
    }

    if (owner.role !== ROLES.PROJECT_MANAGER) {
        throw new AppError("Project owner must be a project manager.", 400);
    }

    return prisma.project.create({
        data,
        select: projectSelect
    });
}

exports.updateProject = async (id, updates) => {
    return prisma.project.update({
        where: {id},
        data: updates,
        select: projectSelect
    });
}

exports.deleteProject = async (id) => {
    return prisma.project.delete({
        where: {id},
        select: projectSelect
    });
}