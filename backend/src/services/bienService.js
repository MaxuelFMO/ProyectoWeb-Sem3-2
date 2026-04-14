class BienService {
    constructor(db) {
        this.db = db;
    }

    async getAllBienes() {
        const query = `
            SELECT b.*, tb.nombre as tipo_bien_nombre 
            FROM Bien b 
            LEFT JOIN TipoBien tb ON b.id_tipo_bien = tb.id_tipo_bien
        `;
        const [rows] = await this.db.execute(query);
        return rows;
    }

    async getBienById(id) {
        const query = `
            SELECT b.*, tb.nombre as tipo_bien_nombre 
            FROM Bien b 
            LEFT JOIN TipoBien tb ON b.id_tipo_bien = tb.id_tipo_bien
            WHERE b.id_bien = ?
        `;
        const [rows] = await this.db.execute(query, [id]);
        return rows[0] || null;
    }

    async createBien(data) {
        const { nombre, descripcion, valor, id_tipo_bien } = data;
        const query = `
            INSERT INTO Bien (nombre, descripcion, valor, id_tipo_bien) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await this.db.execute(query, [nombre, descripcion, valor, id_tipo_bien]);
        return result.insertId;
    }

    async updateBien(id, data) {
        const { nombre, descripcion, valor, id_tipo_bien, estado } = data;
        const query = `
            UPDATE Bien 
            SET nombre = ?, descripcion = ?, valor = ?, id_tipo_bien = ?, estado = ? 
            WHERE id_bien = ?
        `;
        await this.db.execute(query, [nombre, descripcion, valor, id_tipo_bien, estado, id]);
    }

    async deleteBien(id) {
        const query = 'DELETE FROM Bien WHERE id_bien = ?';
        await this.db.execute(query, [id]);
    }
}

module.exports = BienService;
