const projectSelect = require("../constants/projectSelect");
const taskSelect = require("../constants/taskSelect");
const userSelect = require("../constants/userSelect");
const prisma = require("../lib/prisma");
const { buildPagination } = require("../utils/pagination");
const AppError = require("../errors/AppError");
const ROLES = require("../constants/roles");

// Helper functions

async function getProjectOrThrow(id) {
    const project = await prisma.project.findUnique({
        where: {
                id,
                isArchived: false
                },
        select: projectSelect
    });

    if (!project) {
        throw new AppError("Project not found.", 404);
    }

    return project;
}

function ensureCanAccessProject(user, project) {
    if (user.role === ROLES.ADMIN) {
        return;
    }

    if (
        user.role === ROLES.PROJECT_MANAGER &&
        project.ownerId === user.id
    ) {
        return;
    }

    throw new AppError(
        "You are not authorized to access this project.",
        403
    );
}

async function validateProjectOwner(ownerId) {
    const owner = await prisma.user.findUnique({
        where: {
            id: ownerId
        }
    });

    if (!owner) {
        throw new AppError("Owner not found.", 404);
    }

    if (!owner.isActive) {
        throw new AppError(
            "Project owner must be active.",
            400
        );
    }

    if (owner.role !== ROLES.PROJECT_MANAGER) {
        throw new AppError(
            "Project owner must be a project manager.",
            400
        );
    }

    return owner;
}


// Service functions
exports.getAllProjects = async (
  user,
  { page, limit, status, ownerId, search, sortBy, order },
) => {
  const skip = (page - 1) * limit;

  const authWhere = {};

  if (user.role === ROLES.PROJECT_MANAGER) {
    authWhere.ownerId = user.id;
  } else if (user.role === ROLES.DEVELOPER) {
    authWhere.tasks = {
      some: {
        assigneeId: user.id,
      },
    };
  }

  const queryWhere = {
    ...(status && { status }),
    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),
  };

  if (user.role === ROLES.ADMIN && ownerId) {
    queryWhere.ownerId = ownerId;
  }

  const where = {
    isArchived: false,
    ...authWhere,
    ...queryWhere,
  };

  const orderBy = {
    [sortBy]: order,
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      skip,
      take: limit,
      where,
      orderBy,
      include: {
        owner: {
          select: userSelect,
        },
        tasks: {
          select: taskSelect,
        },
      },
    }),
    prisma.project.count(),
  ]);

  return {
    data: projects,
    pagination: buildPagination(page, limit, total),
  };
};

exports.getProjectById = async (id, user) => {
  const project = await getProjectOrThrow(id);

  ensureCanAccessProject(user, project);

  return project;
};

exports.createProject = async (data) => {
  const owner = await validateProjectOwner(data.ownerId);


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
    select: projectSelect,
  });
};

exports.updateProject = async (user, id, updates) => {
    const project = await getProjectOrThrow(id);

    ensureCanAccessProject(user, project);

    if (updates.ownerId !== undefined) {
        if (user.role !== ROLES.ADMIN) {
            throw new AppError(
                "Only admins can transfer project ownership.",
                403
            );
        }

        await validateProjectOwner(updates.ownerId);
    }

  return prisma.project.update({
    where: { id },
    data: updates,
    select: projectSelect,
  });
};

exports.deleteProject = async (id) => {
    const project = await getProjectOrThrow(id);

    if (project.isArchived) {
        throw new AppError("Project is already archived.", 400);
    }

    return prisma.project.update({
        where: { id },
        data: {
            isArchived: true,
            archivedAt: new Date()
        },
        select: projectSelect
    });
};
