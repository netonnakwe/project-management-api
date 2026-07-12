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
        data: {
            firstName: "Neto",
            lastName: "Nnakwe",
            email: "admin@example.com",
            password,
            role: UserRole.ADMIN
        }
    }),
    prisma.user.upsert({
        data: {
            firstName: "Jane",
            lastName: "Manager",
            email: "manager@example.com",
            password,
            role: UserRole.PROJECT_MANAGER
        }
    }),
    prisma.user.upsert({
        data: {
            firstName: "John",
            lastName: "Developer",
            email: "developer@example.com",
            password,
            role: UserRole.DEVELOPER
        }
    })
]);

    // Create project
    const project = await prisma.project.upsert({
        data: {
            name: "Project Management API",
            description: "Learning Prisma + Express",
            status: ProjectStatus.IN_PROGRESS,
            ownerId: manager.id
        }
    });

    // Create tasks
    await prisma.task.createMany({
        data: [
            {
                title: "Build authentication",
                projectId: project.id,
                assigneeId: developer.id
            },
            {
                title: "Implement RBAC",
                projectId: project.id,
                assigneeId: developer.id
            }
        ]
    });

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