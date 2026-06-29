const projects = require("../data/projects");

exports.getAllProjects = () => {
    return projects;
}

exports.getProjectById = (id) => {
    return projects.find(project => project.id === id);
}
exports.createProject = ({name, description, owner, members}) => {
    const nextId = Math.max(...projects.map(project => project.id), 0) + 1;

    const newProject = {
        id: nextId,
        name,
        description,
        status: "In Progress",
        owner,
        members: members || [1],
        createdAt: new Date().toISOString()
    }

    projects.push(newProject);

    return newProject;
}

exports.updateProject = (id, updates) => {
    const project = exports.getProjectById(id);
    if (!project) {
        return null;
    }

    project.name = updates.name ?? project.name;
    project.description = updates.description ?? project.description;
    project.status = updates.status ?? project.status;
    project.owner = updates.owner ?? project.owner;
    project.members = updates.members ?? project.members;
    project.updatedAt = new Date().toISOString();

    return project;
}

exports.deleteProject = (id) => {
    const project = exports.getProjectById(id);

    if (!project) {
        return false;
    }

    const index = projects.findIndex(project => project.id === id);
    projects.splice(index, 1);

    return true;
}