const request = require("supertest");
const app = require("../src/app");

const prisma = require("../src/lib/prisma");
const { cleanDatabase } = require("./helpers/db");

const {
  createAdmin,
  createProjectManager,
  createDeveloper,
  createProject,
  createArchivedProject,
  createTask,
  createArchivedTask
} = require("./helpers/factories");

const { authenticate } = require("./helpers/auth");

const ROLES = require("../src/constants/roles");
const PROJECT_STATUS = require("../src/constants/projectStatus");
const TASK_STATUS = require("../src/constants/taskStatus");
const TASK_PRIORITY = require("../src/constants/taskPriority");

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await cleanDatabase();
  await prisma.$disconnect();
});

describe("Tasks", () => {
    describe("POST /tasks", () => {
        it("should allow an admin to create a task", async () => {
    const owner = await createProjectManager();

    const project = await createProject({
        ownerId: owner.id
    });

    const developer = await createDeveloper();

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Implement authentication",
            description: "Build the JWT authentication flow.",
            projectId: project.id,
            assigneeId: developer.id,
            status: TASK_STATUS.TODO,
            priority: TASK_PRIORITY.MEDIUM,
            dueDate
        });

    expect(response.status).toBe(201);

    expect(response.body).toEqual(
        expect.objectContaining({
            title: "Implement authentication",
            description: "Build the JWT authentication flow.",
            projectId: project.id,
            assigneeId: developer.id,
            status: TASK_STATUS.TODO,
            priority: TASK_PRIORITY.MEDIUM
        })
    );
        });

        it("should allow a project manager to create a task", async () => {
    const owner = await createProjectManager();

    const project = await createProject({
        ownerId: owner.id
    });

    const developer = await createDeveloper();

    const { token } = await authenticate({
        user: owner
    });

    const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Implement authentication",
            description: "Build the JWT authentication flow.",
            projectId: project.id,
            assigneeId: developer.id,
            status: TASK_STATUS.TODO,
            priority: TASK_PRIORITY.MEDIUM
        });

    expect(response.status).toBe(201);
        });

        it("should reject a developer from creating tasks", async () => {
    const project = await createProject();
    const developer = await createDeveloper();

    const auth = await authenticate({
        role: ROLES.DEVELOPER
    });

    const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${auth.token}`)
        .send({
            title: "Implement authentication",
            description: "Build the JWT authentication flow.",
            projectId: project.id,
            assigneeId: developer.id
        });

    expect(response.status).toBe(403);
        });

        it("should reject a developer from creating a task", async () => {
    const project = await createProject();
    const assignee = await createDeveloper();

    const { token } = await authenticate({
        role: ROLES.DEVELOPER
    });

    const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Implement authentication",
            description: "Build the JWT authentication flow.",
            projectId: project.id,
            assigneeId: assignee.id,
            status: TASK_STATUS.TODO,
            priority: TASK_PRIORITY.MEDIUM
        });

    expect(response.status).toBe(403);
        });

        it("should reject a non-existent project", async () => {
    const developer = await createDeveloper();

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Implement authentication",
            description: "Build the JWT authentication flow.",
            projectId: 999999,
            assigneeId: developer.id
        });

    expect(response.status).toBe(404);

    expect(response.body.message).toBe("Project not found.");
        });

        it("should reject an archived project", async () => {
            const project = await createArchivedProject();
            const developer = await createDeveloper();

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .post("/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Implement authentication",
                    description: "Build the JWT authentication flow.",
                    projectId: project.id,
                    assigneeId: developer.id
                });

            console.log(response.body)
            expect(response.status).toBe(400);

            expect(response.body.message).toBe(
                "Cannot add tasks to an archived project."
            );
        });

        it("should reject a non-existent assignee", async () => {
            const project = await createProject();

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .post("/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Implement authentication",
                    description: "Build the JWT authentication flow.",
                    projectId: project.id,
                    assigneeId: 999999
                });

            expect(response.status).toBe(404);

            expect(response.body.message).toBe("Assignee not found.");
        });

        it("should reject an inactive assignee", async () => {
            const project = await createProject();

            const developer = await createDeveloper({
                isActive: false
            });

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .post("/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Implement authentication",
                    description: "Build the JWT authentication flow.",
                    projectId: project.id,
                    assigneeId: developer.id
                });

            expect(response.status).toBe(400);

            expect(response.body.message).toBe(
                "Assignee account is inactive."
            );
        });

        it("should reject assigning a project manager", async () => {
            const project = await createProject();

            const manager = await createProjectManager();

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .post("/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Implement authentication",
                    description: "Build the JWT authentication flow.",
                    projectId: project.id,
                    assigneeId: manager.id
                });

            expect(response.status).toBe(400);

            expect(response.body.message).toBe(
                "Task assignee must be a developer."
            );
        });

        it("should reject assigning a admin", async () => {
            const project = await createProject();

            const admin = await createAdmin();

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .post("/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Implement authentication",
                    description: "Build the JWT authentication flow.",
                    projectId: project.id,
                    assigneeId: admin.id
                });

            expect(response.status).toBe(400);

            expect(response.body.message).toBe(
                "Task assignee must be a developer."
            );
        });

        it("should allow a project manager to create a task in their own project", async () => {
            const manager = await createProjectManager();

            const project = await createProject({
                owner: manager
            });

            const developer = await createDeveloper();

            const { token } = await authenticate({
                user: manager
            });

            const response = await request(app)
                .post("/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Implement authentication",
                    description: "Build JWT authentication.",
                    projectId: project.id,
                    assigneeId: developer.id
                });

            expect(response.status).toBe(201);
        });

        it("should reject a project manager creating a task in another manager's project", async () => {
            const owner = await createProjectManager();

            const anotherManager = await createProjectManager();

            const project = await createProject({
                owner
            });

            const developer = await createDeveloper();

            const { token } = await authenticate({
                user: anotherManager
            });

            const response = await request(app)
                .post("/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Implement authentication",
                    description: "Build JWT authentication.",
                    projectId: project.id,
                    assigneeId: developer.id
                });

            expect(response.status).toBe(403);

            expect(response.body.message).toBe(
                "You are not allowed to create tasks for this project."
            );
        });

    })

    describe("GET /tasks", () => {
        it("should allow an admin to retrieve all tasks", async () => {
            await createTask();
            await createTask();

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get("/tasks")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(2);
        });

        it("should only return tasks from projects owned by the authenticated project manager", async () => {
            const manager1 = await createProjectManager();
            const manager2 = await createProjectManager();

            const project1 = await createProject({ owner: manager1 });
            const project2 = await createProject({ owner: manager2 });

            await createTask({ project: project1 });
            await createTask({ project: project1 });
            await createTask({ project: project2 });

            const { token } = await authenticate({
                user: manager1
            });

            const response = await request(app)
                .get("/tasks")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(2);

            response.body.data.forEach(task => {
                expect(task.project.ownerId).toBe(manager1.id);
            });
        });

        it("should only return tasks assigned to the authenticated developer", async () => {
            const developer1 = await createDeveloper();
            const developer2 = await createDeveloper();

            await createTask({ assignee: developer1 });
            await createTask({ assignee: developer1 });
            await createTask({ assignee: developer2 });

            const { token } = await authenticate({
                user: developer1
            });

            const response = await request(app)
                .get("/tasks")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(2);

            response.body.data.forEach(task => {
                expect(task.assigneeId).toBe(developer1.id);
            });
        });

        it("should not return archived tasks", async () => {
            await createTask();

            await createTask({
                isArchived: true,
                archivedAt: new Date()
            });

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get("/tasks")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(1);
        });

        it("should only return tasks from projects owned by the authenticated project manager", async () => {
            const manager1 = await createProjectManager();
            const manager2 = await createProjectManager();

            const project1 = await createProject({
                owner: manager1
            });

            const project2 = await createProject({
                owner: manager2
            });

            await createTask({
                title: "Task 1",
                project: project1
            });

            await createTask({
                title: "Task 2",
                project: project1
            });

            await createTask({
                title: "Task 3",
                project: project2
            });

            const { token } = await authenticate({
                user: manager1
            });

            const response = await request(app)
                .get("/tasks")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(2);

            response.body.data.forEach(task => {
                expect(task.project.ownerId).toBe(manager1.id);
            });

            expect(
                response.body.data.map(task => task.title)
            ).toEqual(
                expect.arrayContaining([
                    "Task 1",
                    "Task 2"
                ])
            );
        });

        it("should only return tasks assigned to the authenticated developer", async () => {
            const developer1 = await createDeveloper();
            const developer2 = await createDeveloper();

            await createTask({
                title: "Task A",
                assignee: developer1
            });

            await createTask({
                title: "Task B",
                assignee: developer1
            });

            await createTask({
                title: "Task C",
                assignee: developer2
            });

            const { token } = await authenticate({
                user: developer1
            });

            const response = await request(app)
                .get("/tasks")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(2);

            response.body.data.forEach(task => {
                expect(task.assigneeId).toBe(developer1.id);
            });

            expect(
                response.body.data.map(task => task.title)
            ).toEqual(
                expect.arrayContaining([
                    "Task A",
                    "Task B"
                ])
            );
        });

        it("should filter tasks by status", async () => {
            await createTask({
                status: TASK_STATUS.TODO
            });

            await createTask({
                status: TASK_STATUS.IN_PROGRESS
            });

            await createTask({
                status: TASK_STATUS.DONE
            });

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get(`/tasks?status=${TASK_STATUS.TODO}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(response.body.data).toHaveLength(1);

            expect(response.body.data[0].status)
                .toBe(TASK_STATUS.TODO);
        });

        it("should filter tasks by priority", async () => {
            await createTask({
                priority: TASK_PRIORITY.LOW
            });

            await createTask({
                priority: TASK_PRIORITY.MEDIUM
            });

            await createTask({
                priority: TASK_PRIORITY.HIGH
            });

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get(`/tasks?priority=${TASK_PRIORITY.HIGH}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(response.body.data).toHaveLength(1);

            expect(response.body.data[0].priority)
                .toBe(TASK_PRIORITY.HIGH);
        });

        it("should allow an admin to filter tasks by project", async () => {
            const project1 = await createProject();
            const project2 = await createProject();

            await createTask({
                project: project1
            });

            await createTask({
                project: project2
            });

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get(`/tasks?projectId=${project1.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(response.body.data).toHaveLength(1);

            expect(response.body.data[0].projectId)
                .toBe(project1.id);
        });

        it("should allow an admin to filter tasks by assignee", async () => {
            const developer1 = await createDeveloper();
            const developer2 = await createDeveloper();

            await createTask({
                assignee: developer1
            });

            await createTask({
                assignee: developer2
            });

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get(`/tasks?assigneeId=${developer1.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(response.body.data).toHaveLength(1);

            expect(response.body.data[0].assigneeId)
                .toBe(developer1.id);
        });

        it("should search tasks by title", async () => {
            await createTask({
                title: "Implement authentication",
            });

            await createTask({
                title: "Fix dashboard bug"
            });

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get("/tasks?search=authentication")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(response.body.data).toHaveLength(1);

            expect(response.body.data[0].title)
                .toBe("Implement authentication");
        });

        it("should search tasks by description", async () => {
            await createTask({
                description: "Implement JWT authentication."
            });

            await createTask({
                description: "Fix production bug."
            });

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get("/tasks?search=JWT")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(response.body.data).toHaveLength(1);

            expect(response.body.data[0].description)
                .toContain("JWT");
        });

        it("should perform a case-insensitive search", async () => {
            await createTask({
                title: "Implement Authentication"
            });

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get("/tasks?search=authentication")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(1);
        });

        it("should return an empty list when no tasks match the search term", async () => {
            await createTask({
                title: "Implement authentication"
            });

            await createTask({
                title: "Fix dashboard bug"
            });

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get("/tasks?search=blockchain")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            console.log(response.body.data)

            expect(response.body.data).toEqual([]);

            expect(response.body.pagination).toEqual(
                expect.objectContaining({
                                        page: 1,
                                        limit: 10,
                                        total: 0,
                                        totalPages: 0,
                                        hasNext: false,
                                        hasPrevious: false
                                    })
            );
        });

        it("should not return archived tasks when searching", async () => {
            await createTask({
                title: "Implement authentication"
            });

            await createTask({
                title: "Implement authentication",
                isArchived: true,
                archivedAt: new Date()
            });

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get("/tasks?search=authentication")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(response.body.data).toHaveLength(1);

            expect(response.body.data[0].isArchived).toBeFalsy();
        });

        it("should not return tasks from another project manager's project when searching", async () => {
            const manager1 = await createProjectManager();
            const manager2 = await createProjectManager();

            const project1 = await createProject({ owner: manager1 });
            const project2 = await createProject({ owner: manager2 });

            await createTask({
                title: "Implement authentication",
                project: project1
            });

            await createTask({
                title: "Implement authentication",
                project: project2
            });

            const { token } = await authenticate({
                user: manager1
            });

            const response = await request(app)
                .get("/tasks?search=authentication")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(response.body.data).toHaveLength(1);

            expect(response.body.data[0].project.ownerId).toBe(manager1.id);
        });

        it("should not return tasks assigned to another developer when searching", async () => {
            const developer1 = await createDeveloper();
            const developer2 = await createDeveloper();

            await createTask({
                title: "Implement authentication",
                assignee: developer1
            });

            await createTask({
                title: "Implement authentication",
                assignee: developer2
            });

            const { token } = await authenticate({
                user: developer1
            });

            const response = await request(app)
                .get("/tasks?search=authentication")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(response.body.data).toHaveLength(1);

            expect(response.body.data[0].assigneeId).toBe(developer1.id);
        });

        it("should sort tasks by createdAt in ascending order", async () => {
            await createTask({
                title: "First Task"
            });

            await new Promise(resolve => setTimeout(resolve, 10));

            await createTask({
                title: "Second Task"
            });

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get("/tasks?sortBy=createdAt&order=asc")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(response.body.data[0].title).toBe("First Task");
            expect(response.body.data[1].title).toBe("Second Task");
        });

        it("should sort tasks by createdAt in descending order", async () => {
            await createTask({
                title: "First Task"
            });

            await new Promise(resolve => setTimeout(resolve, 10));

            await createTask({
                title: "Second Task"
            });

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get("/tasks?sortBy=createdAt&order=desc")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(response.body.data[0].title).toBe("Second Task");
            expect(response.body.data[1].title).toBe("First Task");
        });

        it("should sort tasks by priority", async () => {
            await createTask({
                title: "Low",
                priority: TASK_PRIORITY.LOW
            });

            await createTask({
                title: "Medium",
                priority: TASK_PRIORITY.MEDIUM
            });

            await createTask({
                title: "High",
                priority: TASK_PRIORITY.HIGH
            });

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get("/tasks?sortBy=priority&order=asc")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(
                response.body.data.map(task => task.priority)
            ).toEqual([
                TASK_PRIORITY.LOW,
                TASK_PRIORITY.MEDIUM,
                TASK_PRIORITY.HIGH
            ]);
        });

        it("should paginate tasks", async () => {
            for (let i = 1; i <= 15; i++) {
                await createTask({
                    title: `Task ${i}`
                });
            }

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get("/tasks?page=1&limit=10")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(response.body.data).toHaveLength(10);

            expect(response.body.pagination).toEqual(
                expect.objectContaining({
                    page: 1,
                    limit: 10,
                    total: 15,
                    totalPages: 2,
                    hasNext: true,
                    hasPrevious: false
                })
            );
        });

        it("should return the second page of tasks", async () => {
            for (let i = 1; i <= 15; i++) {
                await createTask({
                    title: `Task ${i}`
                });
            }

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get("/tasks?page=2&limit=10")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(response.body.data).toHaveLength(5);

            expect(response.body.pagination).toEqual(
                expect.objectContaining({
                    page: 2,
                    limit: 10,
                    total: 15,
                    totalPages: 2,
                    hasNext: false,
                    hasPrevious: true
                })
            );
        });

        it("should correctly indicate pagination navigation", async () => {
            for (let i = 1; i <= 15; i++) {
                await createTask({
                    title: `Task ${i}`
                });
            }

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const firstPage = await request(app)
                .get("/tasks?page=1&limit=10")
                .set("Authorization", `Bearer ${token}`);

            expect(firstPage.body.pagination.hasNext).toBe(true);
            expect(firstPage.body.pagination.hasPrevious).toBe(false);

            const secondPage = await request(app)
                .get("/tasks?page=2&limit=10")
                .set("Authorization", `Bearer ${token}`);

            expect(secondPage.body.pagination.hasNext).toBe(false);
            expect(secondPage.body.pagination.hasPrevious).toBe(true);
        });
    })

    describe("GET /tasks/:id", () => {
        it("should allow an admin to retrieve any task", async () => {
            const task = await createTask();

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(response.body).toEqual(
                expect.objectContaining({
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    projectId: task.projectId,
                    assigneeId: task.assigneeId,
                    status: task.status,
                    priority: task.priority
                })
            );
        });

        it("should allow a project manager to retrieve a task in their own project", async () => {
            const manager = await createProjectManager();

            const project = await createProject({
                owner: manager
            });

            const task = await createTask({
                project
            });

            const { token } = await authenticate({
                user: manager
            });

            const response = await request(app)
                .get(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(response.body.id).toBe(task.id);
        });

        it("should reject a project manager retrieving a task in another manager's project", async () => {
            const manager1 = await createProjectManager();
            const manager2 = await createProjectManager();

            const project = await createProject({
                owner: manager2
            });

            const task = await createTask({
                project
            });

            const { token } = await authenticate({
                user: manager1
            });

            const response = await request(app)
                .get(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(403);

            expect(response.body.message).toMatch(/not authorized/i);
        });

        it("should allow a developer to retrieve their assigned task", async () => {
            const developer = await createDeveloper();

            const task = await createTask({
                assignee: developer
            });

            const { token } = await authenticate({
                user: developer
            });

            const response = await request(app)
                .get(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(response.body.id).toBe(task.id);
        });

        it("should reject a developer retrieving another developer's task", async () => {
            const developer1 = await createDeveloper();
            const developer2 = await createDeveloper();

            const task = await createTask({
                assignee: developer2
            });

            const { token } = await authenticate({
                user: developer1
            });

            const response = await request(app)
                .get(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(403);

            expect(response.body.message).toMatch(/not authorized/i);
        });

        it("should return 404 when the task does not exist", async () => {
            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get("/tasks/999999")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(404);

            expect(response.body.message).toBe("Task not found.");
        });

        it("should return 404 when the task is archived", async () => {
            const task = await createTask();

            await prisma.task.update({
                where: {
                    id: task.id
                },
                data: {
                    isArchived: true,
                    archivedAt: new Date()
                }
            });

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(404);

            expect(response.body.message).toBe("Task not found.");
        });

        it("should return 400 for an invalid task id", async () => {
            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .get("/tasks/abc")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(400);

            expect(response.body.message).toBe("Invalid ID");
        });
    })

    describe("PATCH /tasks/:id", () => {
        it("should allow an admin to update any task", async () => {
            const task = await createTask();

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .patch(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Updated title",
                    status: TASK_STATUS.IN_PROGRESS
                });

            expect(response.status).toBe(200);

            expect(response.body).toEqual(
                expect.objectContaining({
                    id: task.id,
                    title: "Updated title",
                    status: TASK_STATUS.IN_PROGRESS
                })
            );
            console.log(response.status);
            console.log(response.body);
        });

        it("should allow a project manager to update a task in their own project", async () => {
            const manager = await createProjectManager();

            const project = await createProject({
                owner: manager
            });

            const task = await createTask({
                project
            });

            const { token } = await authenticate({
                user: manager
            });

            const response = await request(app)
                .patch(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    priority: TASK_PRIORITY.HIGH
                });

            expect(response.status).toBe(200);

            expect(response.body.priority).toBe(TASK_PRIORITY.HIGH);
        });

        it("should allow a developer to update the status of their assigned task", async () => {
            const developer = await createDeveloper();

            const task = await createTask({
                assignee: developer
            });

            const { token } = await authenticate({
                user: developer
            });

            const response = await request(app)
                .patch(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: TASK_STATUS.DONE
                });

            expect(response.status).toBe(200);

            expect(response.body.status).toBe(TASK_STATUS.DONE);
        });

        it("should reject a developer updating restricted fields", async () => {
            const developer = await createDeveloper();

            const task = await createTask({
                assignee: developer
            });

            const { token } = await authenticate({
                user: developer
            });

            const response = await request(app)
                .patch(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    priority: TASK_PRIORITY.HIGH
                });

            expect(response.status).toBe(403);

            expect(response.body.message).toMatch(/developers can only update/i);
        });

        it("should reject a project manager updating another manager's task", async () => {
            const manager1 = await createProjectManager();
            const manager2 = await createProjectManager();

            const project = await createProject({
                owner: manager2
            });

            const task = await createTask({
                project
            });

            const { token } = await authenticate({
                user: manager1
            });

            const response = await request(app)
                .patch(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Updated title"
                });

            expect(response.status).toBe(403);

            expect(response.body.message).toMatch(/not authorized/i);
        });

        it("should reject a developer updating another developer's task", async () => {
            const developer1 = await createDeveloper();
            const developer2 = await createDeveloper();

            const task = await createTask({
                assignee: developer2
            });

            const { token } = await authenticate({
                user: developer1
            });

            const response = await request(app)
                .patch(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: TASK_STATUS.DONE
                });

            expect(response.status).toBe(403);

            expect(response.body.message).toMatch(/not authorized/i);
        });

        it("should allow an admin to reassign a task", async () => {
            const developer1 = await createDeveloper();
            const developer2 = await createDeveloper();

            const task = await createTask({
                assignee: developer1
            });

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .patch(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    assigneeId: developer2.id
                });

            expect(response.status).toBe(200);

            expect(response.body.assigneeId).toBe(developer2.id);
        });

        it("should allow a project manager to reassign a task", async () => {
            const manager = await createProjectManager();

            const project = await createProject({
                owner: manager
            });

            const developer1 = await createDeveloper();
            const developer2 = await createDeveloper();

            const task = await createTask({
                project,
                assignee: developer1
            });

            const { token } = await authenticate({
                user: manager
            });

            const response = await request(app)
                .patch(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    assigneeId: developer2.id
                });

            expect(response.status).toBe(200);

            expect(response.body.assigneeId).toBe(developer2.id);
        });

        it("should return 400 for an invalid task id", async () => {
            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .patch("/tasks/abc")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: TASK_STATUS.DONE
                });

            expect(response.status).toBe(400);
        });

        it("should return 404 when the task does not exist", async () => {
            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .patch("/tasks/999999")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: TASK_STATUS.DONE
                });

            expect(response.status).toBe(404);

            expect(response.body.message).toBe("Task not found.");
        });

        it("should return 404 when updating an archived task", async () => {
            const task = await createTask();

            await prisma.task.update({
                where: {
                    id: task.id
                },
                data: {
                    isArchived: true,
                    archivedAt: new Date()
                }
            });

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .patch(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: TASK_STATUS.DONE
                });

            expect(response.status).toBe(404);
        });

        it("should reject an empty update request", async () => {
            const task = await createTask();

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .patch(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({});

            expect(response.status).toBe(400);
        });

        it("should reject assigning a task to a non-existent developer", async () => {
            const task = await createTask();

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .patch(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    assigneeId: 999999
                });

            console.log(response.body)
            expect(response.status).toBe(404);
        });

        it("should reject assigning a task to a project manager", async () => {
            const manager = await createProjectManager();

            const task = await createTask();

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .patch(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    assigneeId: manager.id
                });

            expect(response.status).toBe(400);
        });

        it("should reject moving a task to a non-existent project", async () => {
            const task = await createTask();

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .patch(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    projectId: 999999
                });

            expect(response.status).toBe(404);
        });

        it("should reject moving a task to an archived project", async () => {
            const archivedProject = await createArchivedProject();

            const task = await createTask();

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .patch(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    projectId: archivedProject.id
                });

            expect(response.status).toBe(400);
        });

        it("should update only the provided fields", async () => {
            const task = await createTask({
                title: "Original title",
                description: "Original description",
                priority: TASK_PRIORITY.MEDIUM
            });

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .patch(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Updated title"
                });

            expect(response.status).toBe(200);

            expect(response.body.title).toBe("Updated title");
            expect(response.body.description).toBe("Original description");
            expect(response.body.priority).toBe(TASK_PRIORITY.MEDIUM);
        });

        it("should return 400 for an invalid task id", async () => {
            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .patch("/tasks/abc")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: TASK_STATUS.DONE
                });

            expect(response.status).toBe(400);
        });

        it("should return 404 when the task does not exist", async () => {
            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .patch("/tasks/999999")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: TASK_STATUS.DONE
                });

            expect(response.status).toBe(404);

            expect(response.body.message).toBe("Task not found.");
        });

        it("should return 404 when updating an archived task", async () => {
            const task = await createTask();

            await prisma.task.update({
                where: {
                    id: task.id
                },
                data: {
                    isArchived: true,
                    archivedAt: new Date()
                }
            });

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .patch(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: TASK_STATUS.DONE
                });

            expect(response.status).toBe(404);
        });

        it("should reject an empty update request", async () => {
            const task = await createTask();

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .patch(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({});

            expect(response.status).toBe(400);
        });
    })

    describe("DELETE /tasks/:id", () => {
        it("should allow an admin to archive any task", async () => {
            const task = await createTask();

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .delete(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(204);

            const archivedTask = await prisma.task.findUnique({
                where: { id: task.id }
            });

            expect(archivedTask.isArchived).toBe(true);
            expect(archivedTask.archivedAt).not.toBeNull();
        });

        it("should allow a project manager to archive tasks in their project", async () => {
            const manager = await createProjectManager();

            const project = await createProject({
                owner: manager
            });

            const task = await createTask({
                project
            });

            const { token } = await authenticate({
                user: manager
            });

            const response = await request(app)
                .delete(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(204);
        });

        it("should reject a project manager archiving another manager's task", async () => {
            const manager1 = await createProjectManager();
            const manager2 = await createProjectManager();

            const project = await createProject({
                owner: manager2
            });

            const task = await createTask({
                project
            });

            const { token } = await authenticate({
                user: manager1
            });

            const response = await request(app)
                .delete(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(403);

            expect(response.body.message).toMatch(/not authorized/i);
        });

        it("should reject a developer archiving their own task", async () => {
            const developer = await createDeveloper();

            const task = await createTask({
                assignee: developer
            });

            const { token } = await authenticate({
                user: developer
            });

            const response = await request(app)
                .delete(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(403);

            expect(response.body.message).toBe("You do not have permission to perform this action.");
        });

        it("should reject a developer archiving another developer's task", async () => {
            const developer1 = await createDeveloper();
            const developer2 = await createDeveloper();

            const task = await createTask({
                assignee: developer2
            });

            const { token } = await authenticate({
                user: developer1
            });

            const response = await request(app)
                .delete(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(403);

            expect(response.body.message).toBe("You do not have permission to perform this action.");
        });

        it("should return 400 for an invalid task id", async () => {
            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .delete("/tasks/abc")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(400);
        });

        it("should return 404 when the task does not exist", async () => {
            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .delete("/tasks/999999")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(404);

            expect(response.body.message).toBe("Task not found.");
        });

        it("should return 404 when archiving an already archived task", async () => {
            const task = await createArchivedTask();

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            const response = await request(app)
                .delete(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(404);
        });

        it("should not return archived tasks in the task list", async () => {
            const task = await createTask();

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            await request(app)
                .delete(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`);

            const response = await request(app)
                .get("/tasks")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(
                response.body.data.some(t => t.id === task.id)
            ).toBe(false);
        });

        it("should not return an archived task", async () => {
            const task = await createTask();

            const { token } = await authenticate({
                role: ROLES.ADMIN
            });

            await request(app)
                .delete(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`);

            const response = await request(app)
                .get(`/tasks/${task.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(404);
        });
    })
})