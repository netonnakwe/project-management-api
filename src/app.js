const express = require("express");
const logger = require("./middleware/logger")

const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes")
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

app.use(logger);

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Project Management API is running!"
    });
})

app.use("/tasks", taskRoutes);

app.use("/projects", projectRoutes);

app.use("/users", userRoutes);

app.use("/auth", authRoutes);

app.use(errorHandler);

module.exports = app;