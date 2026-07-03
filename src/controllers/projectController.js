const projectService = require("../services/projectService")
const PROJECT_STATUS = require("../constants/projectStatus")
const validStatuses = Object.values(PROJECT_STATUS);
const asyncHandler = require("../middleware/asyncHandler")

exports.getProjects = asyncHandler(async (req, res) => {
    const projects = await projectService.getAllProjects();
    res.status(200).json(projects);
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
    const {name, description, status, ownerId} = req.body;

    if (!name || !description || !ownerId) {
        return res.status(400).json({
            message: "Missing required fields: name, description, ownerId."
        });
    }

    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid project status."
        })
    }

    const project = await projectService.createProject({name, description, status: status ?? PROJECT_STATUS.IN_PROGRESS, ownerId})

    res.status(201).json(project);
});

exports.deleteProject = asyncHandler(async (req, res) => {
    await projectService.deleteProject(req.id);

    res.status(204).send()
});