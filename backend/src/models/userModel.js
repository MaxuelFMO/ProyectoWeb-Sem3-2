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

    async findByIdWithHash(id) {
        const [rows] = await this.db.query(
            'SELECT id_persona as id_persona, nombres, apellidos, correo, fecha_nacimiento, direccion, estado, fecha_creacion, password_hash FROM Personas WHERE id_persona = ?',
            [id]
        );
        return rows[0];
    }

    async create(user) {
        const {
            nombres,
            apellidos = '',
            correo,
            id_tipo_cargo,
            id_tipo_documento = null,
            numero_documento = null,
            fecha_nacimiento = null,
            direccion = null,
            password_hash,
        } = user;

        const formattedDireccion = typeof direccion === 'string' && direccion.trim() ? direccion.trim() : null;

        const [result] = await this.db.query(
            'INSERT INTO Personas (nombres, apellidos, correo, id_tipo_cargo, id_tipo_documento, numero_documento, fecha_nacimiento, direccion, password_hash, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)',
            [nombres, apellidos, correo, id_tipo_cargo, id_tipo_documento, numero_documento, fecha_nacimiento, formattedDireccion, password_hash]
        );
        return result.insertId;
    }

    async update(id, user) {
        const {
            nombres = '',
            apellidos = '',
            correo = null,
            id_tipo_cargo = null,
            id_tipo_documento = null,
            numero_documento = null,
            fecha_nacimiento = null,
            direccion = null,
            password_hash = null,
        } = user;

        const formattedDireccion = typeof direccion === 'string' && direccion.trim() ? direccion.trim() : null;

        await this.db.query(
            'UPDATE Personas SET nombres = ?, apellidos = ?, correo = COALESCE(?, correo), id_tipo_cargo = COALESCE(?, id_tipo_cargo), id_tipo_documento = ?, numero_documento = ?, fecha_nacimiento = ?, direccion = ?, password_hash = COALESCE(?, password_hash) WHERE id_persona = ?',
            [nombres, apellidos, correo, id_tipo_cargo, id_tipo_documento, numero_documento, fecha_nacimiento, formattedDireccion, password_hash, id]
        );
        return true;
    }

    async delete(id) {
        await this.db.query('DELETE FROM Personas WHERE id_persona = ?', [id]);
        return true;
    }
}

module.exports = UserModel;
