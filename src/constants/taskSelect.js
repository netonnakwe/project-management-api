const projectSelect = require("./projectSelect");
const userSelect = require("./userSelect");

module.exports = {
    id: true,
    title: true,
    description: true,
    status: true,
    priority: true,
    dueDate: true,
    createdAt: true,
    updatedAt: true,

    projectId: true,
    assigneeId: true,

    project: {
        select: projectSelect
    },

    assignee: {
        select: userSelect
    }
}