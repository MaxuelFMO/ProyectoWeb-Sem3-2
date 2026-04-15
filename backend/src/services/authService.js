const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
    constructor(db) {
        this.db = db;
    }

    async register(user) {
        const { nombres, apellidos = '', correo, password } = user;

        if (!nombres || !correo || !password) {
            throw new Error('Nombre, correo y contraseña son requeridos');
        }

        const [existing] = await this.db.query(
            'SELECT id_persona FROM Personas WHERE correo = ? OR nombres = ?',
            [correo, nombres]
        );

        if (existing.length > 0) {
            throw new Error('El correo o usuario ya existe');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await this.db.query(
            'INSERT INTO Personas (nombres, apellidos, correo, password_hash, estado) VALUES (?, ?, ?, ?, TRUE)',
            [nombres, apellidos, correo, hashedPassword]
        );

        return result.insertId;
    }

    async login(email, password) {
        const [users] = await this.db.query(
            'SELECT p.id_persona as id_persona, p.nombres, p.apellidos, p.correo, p.password_hash, p.id_tipo_cargo, tc.nombre AS tipo_cargo FROM Personas p LEFT JOIN TipoCargo tc ON p.id_tipo_cargo = tc.id_tipo_cargo WHERE p.correo = ? AND p.estado = TRUE',
            [email]
        );

        if (users.length === 0) {
            throw new Error('Correo o contraseña inválida');
        }

        const user = users[0];

        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            throw new Error('Correo o contraseña inválida');
        }

        const token = jwt.sign(
            { id: user.id_persona, correo: user.correo, id_tipo_cargo: user.id_tipo_cargo },
            process.env.JWT_SECRET || 'super_secret_key_change_in_production',
            { expiresIn: '24h' }
        );

        return {
            token,
            user: {
                id_persona: user.id_persona,
                nombres: user.nombres,
                apellidos: user.apellidos,
                correo: user.correo,
                id_tipo_cargo: user.id_tipo_cargo,
                tipo_cargo: user.tipo_cargo,
            },
        };
    }

    async getCurrentUser(userId) {
        const [users] = await this.db.query(
            'SELECT p.id_persona, p.nombres, p.apellidos, p.correo, p.fecha_nacimiento, p.direccion, p.estado, p.id_tipo_cargo, tc.nombre AS tipo_cargo FROM Personas p LEFT JOIN TipoCargo tc ON p.id_tipo_cargo = tc.id_tipo_cargo WHERE p.id_persona = ?',
            [userId]
        );

        return users[0] || null;
    }
}

module.exports = AuthService;
