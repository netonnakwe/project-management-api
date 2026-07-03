const userService = require("../services/userService")

exports.getUsers = async (req, res) => {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
};

exports.addUser = async (req, res) => {
    const {firstName, lastName, email, role} = req.body;

    if (!firstName || !lastName || !email || !role) {
        return res.status(400).json({
            message: "All fields are required."
        });
    }

    const user = await userService.createUser({firstName, lastName, email, role})

    res.status(201).json(user);
} 

exports.getSingleUser = async (req, res) => {
    const user = await userService.getUserById(req.id);
    
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
    
    res.status(200).json(user)
}

exports.updateUser = async (req, res) => {
    const user = await userService.updateUser(req.id, req.body);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }


    res.status(200).json(user);
}

exports.deleteUser = async (req, res) => {
    const isDeleted = await userService.deleteUser(req.id);
    
        if (!isDeleted) {
            return res.status(404).json({
                message: "User not found"
            });
        }
    
        
    
        res.status(204).send()
}