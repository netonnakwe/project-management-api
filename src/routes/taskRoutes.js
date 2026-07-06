const express = require("express");

const router = express.Router();

const taskController = require("../controllers/taskController");
const validateId = require("../middleware/validateId")
const validate = require("../middleware/validate")
const { paginationSchema } = require("../validators/paginationValidator");

const {createTaskSchema, updateTaskSchema} = require("../validators/taskValidator");
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const ROLES = require("../constants/roles");
const { taskQuerySchema } = require("../validators/taskQueryValidator");

router.use(protect);

/**
 * @swagger
 * /tasks:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get all tasks
 *     description: Returns a paginated list of tasks with optional filtering, searching, and sorting.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Search'
 *       - $ref: '#/components/parameters/TaskSortBy'
 *       - $ref: '#/components/parameters/Order'
 *       - $ref: '#/components/parameters/Completed'
 *       - $ref: '#/components/parameters/ProjectId'
 *       - $ref: '#/components/parameters/AssigneeId'
 *     responses:
 *       200:
 *         description: A paginated list of tasks.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedTasksResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/", authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.DEVELOPER), validate(taskQuerySchema, "query"), taskController.getTasks);

/**
 * @swagger
 * /tasks:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Create a new task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *     responses:
 *       201:
 *         description: Task created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskWithRelations'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/", authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), validate(createTaskSchema), taskController.addTask);
/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get a task by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Id'
 *     responses:
 *       200:
 *         description: Task retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskWithRelations'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/:id", authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.DEVELOPER), validateId, taskController.getSingleTask);
/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     tags:
 *       - Tasks
 *     summary: Update a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Id'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *     responses:
 *       200:
 *         description: Task updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskWithRelations'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch("/:id", authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.DEVELOPER), validateId, validate(updateTaskSchema), taskController.updateTask);
/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Delete a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Id'
 *     responses:
 *       200:
 *         description: Task deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete("/:id", authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), validateId, taskController.deleteTask);

module.exports = router;