const UserService = require('../services/userService');

const getAllUsers = async (req, res) => {
    try {
        const userService = new UserService(req.app.get('db'));
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const userService = new UserService(req.app.get('db'));
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createUser = async (req, res) => {
    try {
        const userService = new UserService(req.app.get('db'));
        const id = await userService.createUser(req.body);
        res.status(201).json({ id, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const userService = new UserService(req.app.get('db'));
        await userService.updateUser(req.params.id, req.body);
        res.status(200).json({ message: 'User updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userService = new UserService(req.app.get('db'));
        await userService.deleteUser(req.params.id);
        res.status(200).json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
