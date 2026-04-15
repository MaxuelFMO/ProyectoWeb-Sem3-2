const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
    constructor(db) {
        this.db = db;
    }

    async register(user) {
        const { name, apellidos, password } = user;
        
        // Verificar si user existe
        const [existing] = await this.db.query(
            'SELECT id_persona FROM Personas WHERE nombres = ?',
            [name]
        );
        
        if (existing.length > 0) {
            throw new Error('Usuario ya existe');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear user
        const [result] = await this.db.query(
            'INSERT INTO Personas (nombres, apellidos, password_hash, estado) VALUES (?, ?, ?, TRUE)',
            [name, apellidos || '', hashedPassword]
        );

        return result.insertId;
    }

    async login(name, password) {
        // Buscar user
        const [users] = await this.db.query(
            'SELECT id_persona as id, nombres as name, password_hash FROM Personas WHERE nombres = ? AND estado = TRUE',
            [name]
        );

        if (users.length === 0) {
            throw new Error('Usuario o contraseña inválida');
        }

        const user = users[0];

        // Verificar password
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            throw new Error('Usuario o contraseña inválida');
        }

        // Generar JWT
        const token = jwt.sign(
            { id: user.id, name: user.name },
            process.env.JWT_SECRET || 'super_secret_key_change_in_production',
            { expiresIn: '24h' }
        );

        return { token, user: { id: user.id, name: user.name } };
    }

    async getCurrentUser(userId) {
        const [users] = await this.db.query(
            'SELECT id_persona as id, nombres as name, apellidos, fecha_nacimiento, direccion, estado FROM Personas WHERE id_persona = ?',
            [userId]
        );

        return users[0] || null;
    }
}

module.exports = AuthService;
