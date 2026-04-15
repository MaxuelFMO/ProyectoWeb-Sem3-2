class UserModel {
    constructor(db) {
        this.db = db;
    }

    async findAll() {
        const [rows] = await this.db.query(
            'SELECT id_persona as id_persona, nombres, apellidos, correo, fecha_nacimiento, direccion, estado, fecha_creacion FROM Personas'
        );
        return rows;
    }

    async findById(id) {
        const [rows] = await this.db.query(
            'SELECT id_persona as id_persona, nombres, apellidos, correo, fecha_nacimiento, direccion, estado, fecha_creacion FROM Personas WHERE id_persona = ?',
            [id]
        );
        return rows[0];
    }

    async create(user) {
        const {
            nombres,
            apellidos = '',
            correo,
            fecha_nacimiento = null,
            direccion = '',
            password_hash,
        } = user;

        const [result] = await this.db.query(
            'INSERT INTO Personas (nombres, apellidos, correo, fecha_nacimiento, direccion, password_hash, estado) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
            [nombres, apellidos, correo, fecha_nacimiento, direccion, password_hash]
        );
        return result.insertId;
    }

    async update(id, user) {
        const {
            nombres = '',
            apellidos = '',
            correo = null,
            fecha_nacimiento = null,
            direccion = '',
            password_hash = null,
        } = user;

        await this.db.query(
            'UPDATE Personas SET nombres = ?, apellidos = ?, correo = COALESCE(?, correo), fecha_nacimiento = ?, direccion = ?, password_hash = COALESCE(?, password_hash) WHERE id_persona = ?',
            [nombres, apellidos, correo, fecha_nacimiento, direccion, password_hash, id]
        );
        return true;
    }

    async delete(id) {
        await this.db.query('DELETE FROM Personas WHERE id_persona = ?', [id]);
        return true;
    }
}

module.exports = UserModel;
