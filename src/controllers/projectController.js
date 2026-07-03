const projectService = require("../services/projectService")
const PROJECT_STATUS = require("../constants/projectStatus")
const validStatuses = Object.values(PROJECT_STATUS);

exports.getProjects = async (req, res) => {
    const projects = await projectService.getAllProjects();
    res.status(200).json(projects);
};

exports.getSingleProject = async (req, res) => {

    const project = await projectService.getProjectById(req.id);

    if (!project) {
        return res.status(404).json({
            message: "Project not found"
        });
    }

    res.status(200).json(project);
};

exports.updateProject = async (req, res) => {
    const project = await projectService.updateProject(req.id, req.body);

    if (!project) {
        return res.status(404).json({
            message: "Project not found"
        });
    }


    res.status(200).json(project);
};

exports.addProject = async (req, res) => {
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
};

exports.deleteProject = async (req, res) => {
    const isDeleted = await projectService.deleteProject(req.id);

    if (!isDeleted) {
        return res.status(404).json({
            message: "Project not found"
        });
    }

    

    res.status(204).send()
};