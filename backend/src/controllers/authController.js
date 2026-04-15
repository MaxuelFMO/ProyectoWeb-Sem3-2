const AuthService = require('../services/authService');

const register = async (req, res) => {
    try {
        const authService = new AuthService(req.app.get('db'));
        const id = await authService.register(req.body);
        res.status(201).json({ message: 'Usuario registrado exitosamente', id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Correo y contraseña requeridos' });
        }

        const authService = new AuthService(req.app.get('db'));
        const { token, user } = await authService.login(email, password);

        res.status(200).json({ token, user });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const authService = new AuthService(req.app.get('db'));
        const user = await authService.getCurrentUser(req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { register, login, getCurrentUser };
