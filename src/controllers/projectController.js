const projectService = require("../services/projectService")

exports.getProjects = (req, res) => {
    const projects = projectService.getAllProjects();
    res.status(200).json(projects);
};

exports.getSingleProject = (req, res) => {

    const project = projectService.getProjectById(req.id);

    if (!project) {
        return res.status(404).json({
            message: "Project not found"
        });
    }

    res.status(200).json(project);
};

exports.updateProject = (req, res) => {
    const project = projectService.updateProject(req.id, req.body);

    if (!project) {
        return res.status(404).json({
            message: "Project not found"
        });
    }


    res.status(200).json(project);
};

exports.addProject = (req, res) => {
    const {name, description, owner, members} = req.body;

    if (!name || !description || !owner) {
        return res.status(400).json({
            message: "Missing required fields: name, description, owner."
        });
    }

    const project = projectService.createProject({name, description, owner, members})

    res.status(201).json(project);
};

exports.deleteProject = (req, res) => {
    const isDeleted = projectService.deleteProject(req.id);

    if (!isDeleted) {
        return res.status(404).json({
            message: "Project not found"
        });
    }

    

    res.status(204).send()
};