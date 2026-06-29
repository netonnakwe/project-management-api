const users = require("../data/users")

exports.getUsers = (req, res) => {
    res.status(200).json(users);
};