class BienService {
    constructor(db) {
        this.db = db;
    }

    async getAllBienes(userId) {
        const query = `
            SELECT b.*, tb.nombre as tipo_bien_nombre 
            FROM Bien b 
            LEFT JOIN TipoBien tb ON b.id_tipo_bien = tb.id_tipo_bien
            WHERE b.id_persona = ?
        `;
        const [rows] = await this.db.execute(query, [userId]);
        return rows;
    }

    async getBienById(id, userId) {
        const query = `
            SELECT b.*, tb.nombre as tipo_bien_nombre 
            FROM Bien b 
            LEFT JOIN TipoBien tb ON b.id_tipo_bien = tb.id_tipo_bien
            WHERE b.id_bien = ? AND b.id_persona = ?
        `;
        const [rows] = await this.db.execute(query, [id, userId]);
        return rows[0] || null;
    }

    async createBien(data, userId) {
        const { nombre, descripcion, valor, id_tipo_bien } = data;
        const query = `
            INSERT INTO Bien (nombre, descripcion, valor, id_tipo_bien, id_persona) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await this.db.execute(query, [nombre, descripcion, valor, id_tipo_bien, userId]);
        return result.insertId;
    }

    async updateBien(id, data, userId) {
        const { nombre, descripcion, valor, id_tipo_bien, estado } = data;
        const existing = await this.getBienById(id, userId);
        if (!existing) {
            throw new Error('Bien no encontrado o no tienes permisos');
        }
        const query = `
            UPDATE Bien 
            SET nombre = ?, descripcion = ?, valor = ?, id_tipo_bien = ?, estado = ? 
            WHERE id_bien = ?
        `;
        await this.db.execute(query, [nombre, descripcion, valor, id_tipo_bien, estado, id]);
    }

    async getTiposBien() {
        const query = 'SELECT id_tipo_bien, nombre FROM TipoBien ORDER BY nombre';
        const [rows] = await this.db.execute(query);
        return rows;
    }

    async importBienes(bienes, userId) {
        if (!Array.isArray(bienes) || bienes.length === 0) {
            return 0;
        }

        const values = bienes.map((bien) => [
            bien.nombre,
            bien.descripcion || null,
            bien.valor ?? null,
            bien.id_tipo_bien ?? null,
            userId,
        ]);

        const query = 'INSERT INTO Bien (nombre, descripcion, valor, id_tipo_bien, id_persona) VALUES ?';
        const [result] = await this.db.query(query, [values]);
        return result.affectedRows || 0;
    }

    async deleteBien(id, userId) {
        const existing = await this.getBienById(id, userId);
        if (!existing) {
            throw new Error('Bien no encontrado o no tienes permisos');
        }
        const query = 'DELETE FROM Bien WHERE id_bien = ?';
        await this.db.execute(query, [id]);
    }
}

module.exports = BienService;
