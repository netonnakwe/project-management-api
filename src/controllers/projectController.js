const projectService = require("../services/projectService")
const PROJECT_STATUS = require("../constants/projectStatus")
const asyncHandler = require("../middleware/asyncHandler")

exports.getProjects = asyncHandler(async (req, res) => {
    const { page, limit } = req.validated.query;
    const result = await projectService.getAllProjects(page, limit);
    res.status(200).json(result);
});

exports.getSingleProject = asyncHandler(async (req, res) => {

    const project = await projectService.getProjectById(req.id);

    if (!project) {
        return res.status(404).json({
            message: "Project not found"
        });
    }

    res.status(200).json(project);
});

exports.updateProject = asyncHandler(async (req, res) => {
    const project = await projectService.updateProject(req.id, req.body);

    res.status(200).json(project);
});

exports.addProject = asyncHandler(async (req, res) => {
    const project = await projectService.createProject({
        ...req.body, status: req.body.status ?? PROJECT_STATUS.IN_PROGRESS
    });

    res.status(201).json(project);
});

exports.deleteProject = asyncHandler(async (req, res) => {
    await projectService.deleteProject(req.id);

    res.status(204).send()
});