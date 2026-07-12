const { PrismaClient, UserRole, ProjectStatus } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Clear existing data
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    // Hash passwords
    const password = await bcrypt.hash("Password123!", 10);

    // Create users
    const [admin, manager, developer] = await prisma.$transaction([
            prisma.user.upsert({
                where: {
                    email: "admin@example.com",
                },
                update: {},
                create: {
                    firstName: "Neto",
                    lastName: "Nnakwe",
                    email: "admin@example.com",
                    password,
                    role: UserRole.ADMIN,
                },
            }),

            prisma.user.upsert({
                where: {
                    email: "manager@example.com",
                },
                update: {},
                create: {
                    firstName: "Jane",
                    lastName: "Manager",
                    email: "manager@example.com",
                    password,
                    role: UserRole.PROJECT_MANAGER,
                },
            }),

            prisma.user.upsert({
                where: {
                    email: "developer@example.com",
                },
                update: {},
                create: {
                    firstName: "John",
                    lastName: "Developer",
                    email: "developer@example.com",
                    password,
                    role: UserRole.DEVELOPER,
                },
            }),
        ]);

        // Create project
        const existingProject = await prisma.project.findFirst({
            where: {
                name: "Project Management API",
                ownerId: manager.id,
            },
        });

        const project =
            existingProject ??
            (await prisma.project.create({
                data: {
                    name: "Project Management API",
                    description: "Learning Prisma + Express",
                    status: ProjectStatus.IN_PROGRESS,
                    ownerId: manager.id,
                },
            }));

        // Create tasks
        const authTask = await prisma.task.findFirst({
            where: {
                title: "Build authentication",
                projectId: project.id,
            },
        });

        if (!authTask) {
            await prisma.task.create({
                data: {
                    title: "Build authentication",
                    description: "Implement JWT authentication flow.",
                    projectId: project.id,
                    assigneeId: developer.id,
                },
            });
        }

        const rbacTask = await prisma.task.findFirst({
            where: {
                title: "Implement RBAC",
                projectId: project.id,
            },
        });

        if (!rbacTask) {
            await prisma.task.create({
                data: {
                    title: "Implement RBAC",
                    description: "Implement role-based access control.",
                    projectId: project.id,
                    assigneeId: developer.id,
                },
            });
        }

    console.log("✅ Database seeded successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });