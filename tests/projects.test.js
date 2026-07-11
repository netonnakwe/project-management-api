const request = require("supertest");
const app = require("../src/app");

const prisma = require("../src/lib/prisma");
const { cleanDatabase } = require("./helpers/db");

const {
  createAdmin,
  createProjectManager,
  createDeveloper,
  createProject,
} = require("./helpers/factories");

const { authenticate } = require("./helpers/auth");

const ROLES = require("../src/constants/roles");
const PROJECT_STATUS = require("../src/constants/projectStatus");

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await cleanDatabase();
  await prisma.$disconnect();
});

describe("Projects", () => {
  describe("POST /projects", () => {
    it("should create a project", async () => {
      const owner = await createProjectManager();

      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .post("/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Website Redesign",
          description: "New marketing website",
          ownerId: owner.id,
          status: PROJECT_STATUS.IN_PROGRESS,
        });

      expect(response.status).toBe(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          name: "Website Redesign",
          description: "New marketing website",
          ownerId: owner.id,
          status: PROJECT_STATUS.IN_PROGRESS,
        }),
      );

      const project = await prisma.project.findUnique({
        where: {
          id: response.body.id,
        },
      });

      expect(project).not.toBeNull();
    });

    it("should allow a project manager to create a project", async () => {
      const owner = await createProjectManager();

      const { token } = await authenticate({
        role: ROLES.PROJECT_MANAGER,
      });

      const response = await request(app)
        .post("/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Mobile App",
          description: "Build a mobile application",
          ownerId: owner.id,
          status: PROJECT_STATUS.IN_PROGRESS,
        });

      expect(response.status).toBe(201);

      expect(response.body.name).toBe("Mobile App");
    });

    it("should reject developers from creating projects", async () => {
      const owner = await createProjectManager();

      const { token } = await authenticate({
        role: ROLES.DEVELOPER,
      });

      const response = await request(app)
        .post("/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Mobile App",
          description: "Build a mobile application",
          ownerId: owner.id,
        });

      expect(response.status).toBe(403);
    });

    it("should reject unauthenticated requests", async () => {
      const owner = await createProjectManager();

      const response = await request(app).post("/projects").send({
        name: "Website",
        description: "Marketing website",
        ownerId: owner.id,
      });

      expect(response.status).toBe(401);
    });

    it("should reject a missing project name", async () => {
      const owner = await createProjectManager();

      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .post("/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
          description: "Marketing website",
          ownerId: owner.id,
        });

      expect(response.status).toBe(400);
    });

    it("should reject a missing description", async () => {
      const owner = await createProjectManager();

      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .post("/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Website",
          ownerId: owner.id,
        });

      expect(response.status).toBe(400);
    });

    it("should reject an invalid project status", async () => {
      const owner = await createProjectManager();

      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .post("/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Website",
          description: "Marketing website",
          ownerId: owner.id,
          status: "FINISHED",
        });

      expect(response.status).toBe(400);
    });

    it("should reject a non-existent owner", async () => {
      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .post("/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Website",
          description: "Marketing website",
          ownerId: 999999,
          status: PROJECT_STATUS.IN_PROGRESS,
        });

      expect(response.status).toBe(404);
    });

    it("should reject an inactive owner", async () => {
      const owner = await createProjectManager({
        isActive: false,
      });

      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .post("/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Website",
          description: "Marketing website",
          ownerId: owner.id,
        });

      expect(response.status).toBe(400);
    });

    it("should reject an owner that is an admin", async () => {
      const admin = await createAdmin();

      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .post("/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Website",
          description: "Marketing website",
          ownerId: admin.id,
          status: PROJECT_STATUS.IN_PROGRESS,
        });

      expect(response.status).toBe(400);

      expect(response.body.message).toBe(
        "Project owner must be a project manager.",
      );
    });

    it("should reject an owner that is a developer", async () => {
      const developer = await createDeveloper();

      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .post("/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Website",
          description: "Marketing website",
          ownerId: developer.id,
          status: PROJECT_STATUS.IN_PROGRESS,
        });

      expect(response.status).toBe(400);

      expect(response.body.message).toBe(
        "Project owner must be a project manager.",
      );
    });
  });

  describe("GET /projects", () => {
    it("should paginate projects", async () => {
      const owner = await createProjectManager();

      await createProject({ name: "Project A", ownerId: owner.id });
      await createProject({ name: "Project B", ownerId: owner.id });
      await createProject({ name: "Project C", ownerId: owner.id });

      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .get("/projects?page=1&limit=2")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.data).toHaveLength(2);

      expect(response.body.pagination).toEqual(
        expect.objectContaining({
          page: 1,
          limit: 2,
          total: 3,
          totalPages: 2,
        }),
      );
    });

    it("should search projects by name", async () => {
      const owner = await createProjectManager();

      await createProject({
        name: "Website Redesign",
        ownerId: owner.id,
      });

      await createProject({
        name: "Inventory System",
        ownerId: owner.id,
      });

      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .get("/projects?search=Website")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe("Website Redesign");
    });

    it("should filter projects by status", async () => {
      const owner = await createProjectManager();

      await createProject({
        name: "Website",
        status: PROJECT_STATUS.IN_PROGRESS,
        ownerId: owner.id,
      });

      await createProject({
        name: "Mobile App",
        status: PROJECT_STATUS.COMPLETED,
        ownerId: owner.id,
      });

      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .get(`/projects?status=${PROJECT_STATUS.COMPLETED}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe(PROJECT_STATUS.COMPLETED);
    });

    it("should only return projects owned by the authenticated project manager", async () => {
      const owner1 = await createProjectManager();
      const owner2 = await createProjectManager();

      await createProject({
        name: "Owner One Project",
        ownerId: owner1.id,
      });

      await createProject({
        name: "Owner Two Project",
        ownerId: owner2.id,
      });

      const { token } = await authenticate({
        user: owner1,
      });

      const response = await request(app)
        .get("/projects")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].ownerId).toBe(owner1.id);
    });

    it("should allow an admin to view all projects", async () => {
      const owner1 = await createProjectManager();
      const owner2 = await createProjectManager();

      await createProject({
        name: "Project One",
        ownerId: owner1.id,
      });

      await createProject({
        name: "Project Two",
        ownerId: owner2.id,
      });

      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .get("/projects")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    it("should allow an admin to filter by owner", async () => {
      const owner1 = await createProjectManager();
      const owner2 = await createProjectManager();

      await createProject({
        name: "Website",
        ownerId: owner1.id,
      });

      await createProject({
        name: "Mobile App",
        ownerId: owner2.id,
      });

      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .get(`/projects?ownerId=${owner1.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].ownerId).toBe(owner1.id);
    });

    it("should sort projects by name", async () => {
      const owner = await createProjectManager();

      await createProject({
        name: "Zeta",
        ownerId: owner.id,
      });

      await createProject({
        name: "Alpha",
        ownerId: owner.id,
      });

      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .get("/projects?sortBy=name&order=asc")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.data[0].name).toBe("Alpha");
      expect(response.body.data[1].name).toBe("Zeta");
    });

    it("should return an empty array when no projects match", async () => {
      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .get("/projects?search=DoesNotExist")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.data).toEqual([]);

      expect(response.body.pagination.total).toBe(0);
    });

    it("should reject unauthenticated requests", async () => {
      const response = await request(app).get("/projects");

      expect(response.status).toBe(401);
    });

    it("should ignore the ownerId filter for project managers", async () => {
      const owner1 = await createProjectManager();
      const owner2 = await createProjectManager();

      await createProject({
        name: "Owner One Project",
        ownerId: owner1.id,
      });

      await createProject({
        name: "Owner Two Project",
        ownerId: owner2.id,
      });

      const { token } = await authenticate({
        user: owner1,
      });

      const response = await request(app)
        .get(`/projects?ownerId=${owner2.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.data).toHaveLength(1);

      expect(response.body.data[0]).toEqual(
        expect.objectContaining({
          ownerId: owner1.id,
          name: "Owner One Project",
        }),
      );
    });

    it("should search projects by description", async () => {
      const owner = await createProjectManager();

      await createProject({
        name: "Website",
        description: "Internal HR portal",
        ownerId: owner.id,
      });

      await createProject({
        name: "Mobile App",
        description: "Customer mobile application",
        ownerId: owner.id,
      });

      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .get("/projects?search=customer")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe("Mobile App");
    });

    it("should return an empty array when no projects match", async () => {
      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .get("/projects?search=does-not-exist")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.data).toEqual([]);

      expect(response.body.pagination.total).toBe(0);
    });

    it("should reject an invalid status filter", async () => {
      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .get("/projects?status=INVALID_STATUS")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
    });

    it("should reject an invalid page number", async () => {
      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .get("/projects?page=-1")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
    });

    it("should reject an invalid limit", async () => {
      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .get("/projects?limit=0")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
    });

    it("should reject unauthenticated requests", async () => {
      const response = await request(app).get("/projects");

      expect(response.status).toBe(401);
    });

    it("should reject an invalid sort field", async () => {
      const { token } = await authenticate({
        role: ROLES.ADMIN,
      });

      const response = await request(app)
        .get("/projects?sortBy=password")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
    });
  });

  describe("GET /projects/:id", () => {
    it("should allow an admin to retrieve any project", async () => {
    const owner = await createProjectManager();

    const project = await createProject({
        name: "Website Redesign",
        description: "Marketing website",
        ownerId: owner.id
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .get(`/projects/${project.id}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toEqual(
        expect.objectContaining({
            id: project.id,
            name: "Website Redesign",
            description: "Marketing website",
            ownerId: owner.id,
            status: project.status
        })
    );
    });

    it("should allow a project manager to retrieve their own project", async () => {
    const owner = await createProjectManager();

    const project = await createProject({
        name: "Website Redesign",
        description: "Marketing website",
        ownerId: owner.id
    });

    const { token } = await authenticate({
        user: owner
    });

    const response = await request(app)
        .get(`/projects/${project.id}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toEqual(
        expect.objectContaining({
            id: project.id,
            name: "Website Redesign",
            description: "Marketing website",
            ownerId: owner.id
        })
    );
    });

    it("should prevent a project manager from retrieving another manager's project", async () => {
    const owner1 = await createProjectManager();
    const owner2 = await createProjectManager();

    const project = await createProject({
        name: "Secret Project",
        ownerId: owner2.id
    });

    const { token } = await authenticate({
        user: owner1
    });

    const response = await request(app)
        .get(`/projects/${project.id}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
        message: "You are not authorized to access this project."
    });
    });

    it("should return 404 for a non-existent project", async () => {
    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .get("/projects/999999")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
        message: "Project not found."
    });
    });

    it("should reject an invalid project id", async () => {
    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .get("/projects/abc")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    });

    it("should reject unauthenticated requests", async () => {
    const response = await request(app)
        .get("/projects/1");

    expect(response.status).toBe(401);
    });
  });

  describe("PATCH /projects/:id", () => {
    it("should allow an admin to update any project", async () => {
    const owner = await createProjectManager();

    const project = await createProject({
        ownerId: owner.id
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch(`/projects/${project.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            name: "Updated Project"
        });

    expect(response.status).toBe(200);

    expect(response.body).toEqual(
        expect.objectContaining({
            id: project.id,
            name: "Updated Project"
        })
    );

    const updatedProject = await prisma.project.findUnique({
        where: {
            id: project.id
        }
    });

    expect(updatedProject.name).toBe("Updated Project");
    });

    it("should allow an admin to transfer project ownership", async () => {
    const oldOwner = await createProjectManager();
    const newOwner = await createProjectManager();

    const project = await createProject({
        ownerId: oldOwner.id
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch(`/projects/${project.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            ownerId: newOwner.id
        });

    expect(response.status).toBe(200);

    expect(response.body).toEqual(
        expect.objectContaining({
            id: project.id,
            ownerId: newOwner.id
        })
    );

    const updatedProject = await prisma.project.findUnique({
        where: {
            id: project.id
        }
    });

    expect(updatedProject.ownerId).toBe(newOwner.id);
    });

    it("should prevent a project manager from transferring project ownership", async () => {
    const owner = await createProjectManager();
    const anotherManager = await createProjectManager();

    const project = await createProject({
        ownerId: owner.id
    });

    const { token } = await authenticate({
        user: owner
    });

    const response = await request(app)
        .patch(`/projects/${project.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            ownerId: anotherManager.id
        });

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
        message: "Only admins can transfer project ownership."
    });
    });

    it("should reject assigning a developer as the project owner", async () => {
    const owner = await createProjectManager();
    const developer = await createDeveloper();

    const project = await createProject({
        ownerId: owner.id
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch(`/projects/${project.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            ownerId: developer.id
        });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
        message: "Project owner must be a project manager."
    });
    });

    it("should reject assigning an inactive project manager as the owner", async () => {
    const owner = await createProjectManager();

    const inactiveManager = await createProjectManager({
        isActive: false
    });

    const project = await createProject({
        ownerId: owner.id
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch(`/projects/${project.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            ownerId: inactiveManager.id
        });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
        message: "Project owner must be active."
    });
    });

    it("should reject assigning a non-existent project owner", async () => {
    const owner = await createProjectManager();

    const project = await createProject({
        ownerId: owner.id
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch(`/projects/${project.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            ownerId: 999999
        });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
        message: "Owner not found."
    });
    });

    it("should allow a project manager to update their own project", async () => {
    const owner = await createProjectManager();

    const project = await createProject({
        ownerId: owner.id
    });

    const { token } = await authenticate({
        user: owner
    });

    const response = await request(app)
        .patch(`/projects/${project.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            description: "Updated description"
        });

    expect(response.status).toBe(200);

    expect(response.body).toEqual(
        expect.objectContaining({
            id: project.id,
            description: "Updated description"
        })
    );
    });

    it("should prevent a project manager from updating another manager's project", async () => {
    const owner1 = await createProjectManager();
    const owner2 = await createProjectManager();

    const project = await createProject({
        ownerId: owner2.id
    });

    const { token } = await authenticate({
        user: owner1
    });

    const response = await request(app)
        .patch(`/projects/${project.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            name: "Updated"
        });

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
        message: "You are not authorized to access this project."
    });
    });

    it("should return 404 for a non-existent project", async () => {
    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch("/projects/999999")
        .set("Authorization", `Bearer ${token}`)
        .send({
            name: "Updated"
        });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
        message: "Project not found."
    });
    });

    it("should reject an empty update request", async () => {
    const owner = await createProjectManager();

    const project = await createProject({
        ownerId: owner.id
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch(`/projects/${project.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({});

    expect(response.status).toBe(400);
    });

    it("should reject an invalid status", async () => {
    const owner = await createProjectManager();

    const project = await createProject({
        ownerId: owner.id
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch(`/projects/${project.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            status: "DONE"
        });

    expect(response.status).toBe(400);
    });

    it("should update multiple project fields", async () => {
    const owner = await createProjectManager();

    const project = await createProject({
        ownerId: owner.id
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch(`/projects/${project.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            name: "CRM",
            description: "Customer management",
            status: PROJECT_STATUS.COMPLETED
        });

    expect(response.status).toBe(200);

    expect(response.body).toEqual(
        expect.objectContaining({
            name: "CRM",
            description: "Customer management",
            status: PROJECT_STATUS.COMPLETED
        })
    );
    });

    it("should reject unauthenticated requests", async () => {
    const owner = await createProjectManager();

    const project = await createProject({
        ownerId: owner.id
    });

    const response = await request(app)
        .patch(`/projects/${project.id}`)
        .send({
            name: "Updated"
        });

    expect(response.status).toBe(401);
    });

    it("should reject an invalid project id", async () => {
    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .patch("/projects/abc")
        .set("Authorization", `Bearer ${token}`)
        .send({
            name: "Updated"
        });

    expect(response.status).toBe(400);
    });

  })

  describe("DELETE /projects/:id", () => {
    it("should archive a project", async () => {
    const owner = await createProjectManager();

    const project = await createProject({
        ownerId: owner.id
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .delete(`/projects/${project.id}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);

    const archivedProject = await prisma.project.findUnique({
        where: {
            id: project.id
        }
    });

    expect(archivedProject.isArchived).toBe(true);
    expect(archivedProject.archivedAt).not.toBeNull();
});

    it("should return 404 when the project does not exist", async () => {
    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .delete("/projects/999999")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
        message: "Project not found."
    });
});

    it("should reject archiving an already archived project", async () => {
    const owner = await createProjectManager();

    const project = await createProject({
        ownerId: owner.id
    });

    await prisma.project.update({
        where: {
            id: project.id
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
        .delete(`/projects/${project.id}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
        message: "Project not found."
    });
});

    it("should prevent a project manager from archiving a project", async () => {
    const owner = await createProjectManager();

    const project = await createProject({
        ownerId: owner.id
    });

    const { token } = await authenticate({
        user: owner
    });

    const response = await request(app)
        .delete(`/projects/${project.id}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
});

    it("should prevent a developer from archiving a project", async () => {
    const owner = await createProjectManager();

    const developer = await createDeveloper();

    const project = await createProject({
        ownerId: owner.id
    });

    const { token } = await authenticate({
        user: developer
    });

    const response = await request(app)
        .delete(`/projects/${project.id}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
});

    it("should reject unauthenticated requests", async () => {
    const owner = await createProjectManager();

    const project = await createProject({
        ownerId: owner.id
    });

    const response = await request(app)
        .delete(`/projects/${project.id}`);

    expect(response.status).toBe(401);
});

    it("should reject an invalid project id", async () => {
    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    const response = await request(app)
        .delete("/projects/abc")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
});

    it("should not return archived projects when listing projects", async () => {
    const owner = await createProjectManager();

    const project = await createProject({
        ownerId: owner.id,
        name: "Archived Project"
    });

    const { token } = await authenticate({
        role: ROLES.ADMIN
    });

    // Archive the project
    await request(app)
        .delete(`/projects/${project.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);

    // Retrieve all projects
    const response = await request(app)
        .get("/projects")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(
        response.body.data.find(p => p.id === project.id)
    ).toBeUndefined();
});
  })
});
