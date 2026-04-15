const UserService = require('../services/userService');
const HistorialMovimientosService = require('../services/historialMovimientosService');

const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const userService = new UserService(req.app.get('db'));
        const filters = {
            search: req.query.search,
            estado: req.query.estado
        };

        const users = await userService.getAllUsers(filters);
        const paginated = users.slice(offset, offset + limit);

        res.status(200).json({
            data: paginated,
            total: users.length,
            page,
            limit
        });
    } catch (err) {
        console.error('getAllUsers error:', err);
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
        const historialService = new HistorialMovimientosService(req.app.get('db'));
        
        await userService.updateUser(req.params.id, req.body);

        // Registro en historial
        await historialService.createHistorial({
            id_persona: req.params.id,
            accion: 'Actualización de Perfil',
            descripcion: 'El usuario actualizó sus datos de perfil y ajustes de cuenta.',
            usuario_registro: req.user.correo
        });

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
