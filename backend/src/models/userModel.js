class UserModel {
    constructor(db) {
        this.db = db;
    }

    async findAll(filters = {}) {
        const { search, estado } = filters;
        let whereClauses = [];
        let params = [];

        if (search) {
            whereClauses.push('(nombres LIKE ? OR apellidos LIKE ? OR correo LIKE ?)');
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        if (estado !== undefined && estado !== '') {
            whereClauses.push('estado = ?');
            params.push(estado === 'true' || estado === true || estado === 1);
        }

        const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        const query = `
            SELECT id_persona, nombres, apellidos, correo, fecha_nacimiento, direccion, estado, fecha_creacion, id_tipo_cargo, id_tipo_documento, numero_documento 
            FROM Personas 
            ${whereClause}
            ORDER BY nombres ASC
        `;

        const [rows] = await this.db.query(query, params);
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
