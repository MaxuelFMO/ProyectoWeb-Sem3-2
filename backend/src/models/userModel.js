class UserModel {
    constructor(db) {
        this.db = db;
    }

    async findAll() {
        const [rows] = await this.db.query('SELECT id_persona as id, nombres as name, apellidos, fecha_nacimiento, direccion, estado, fecha_creacion FROM Personas');
        return rows;
    }

    async findById(id) {
        const [rows] = await this.db.query('SELECT id_persona as id, nombres as name, apellidos, fecha_nacimiento, direccion, estado, fecha_creacion FROM Personas WHERE id_persona = ?', [id]);
        return rows[0];
    }

    async create(user) {
        const { name, apellidos = '', fecha_nacimiento = null, direccion = '' } = user;
        const [result] = await this.db.query(
            'INSERT INTO Personas (nombres, apellidos, fecha_nacimiento, direccion, estado) VALUES (?, ?, ?, ?, TRUE)',
            [name, apellidos, fecha_nacimiento, direccion]
        );
        return result.insertId;
    }

    async update(id, user) {
        const { name = '', apellidos = '', fecha_nacimiento = null, direccion = '' } = user;
        await this.db.query(
            'UPDATE Personas SET nombres = ?, apellidos = ?, fecha_nacimiento = ?, direccion = ? WHERE id_persona = ?',
            [name, apellidos, fecha_nacimiento, direccion, id]
        );
        return true;
    }

    async delete(id) {
        await this.db.query('DELETE FROM users WHERE id_persona = ?', [id]);
        return true;
    }
}

module.exports = UserModel;
