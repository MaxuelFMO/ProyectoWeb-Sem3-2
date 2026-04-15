class HistorialMovimientosService {
    constructor(db) {
        this.db = db;
    }

    async getAllHistorial() {
        const query = `
            SELECT hm.*, u.nombres, u.apellidos, d.fecha_inicio, d.fecha_fin
            FROM HistorialMovimientos hm
            LEFT JOIN Personas u ON hm.id_persona = u.id_persona
            LEFT JOIN Desplazamiento d ON hm.id_desplazamiento = d.id_desplazamiento
            ORDER BY hm.fecha_hora DESC
        `;
        const [rows] = await this.db.execute(query);
        return rows;
    }

    async getHistorialByPersona(id_persona) {
        const query = `
            SELECT hm.*, u.nombres, u.apellidos, d.fecha_inicio, d.fecha_fin
            FROM HistorialMovimientos hm
            LEFT JOIN Personas u ON hm.id_persona = u.id_persona
            LEFT JOIN Desplazamiento d ON hm.id_desplazamiento = d.id_desplazamiento
            WHERE hm.id_persona = ?
            ORDER BY hm.fecha_hora DESC
        `;
        const [rows] = await this.db.execute(query, [id_persona]);
        return rows;
    }

    async createHistorial(data) {
        const { id_persona, id_desplazamiento, accion, descripcion, usuario_registro } = data;
        const query = `
            INSERT INTO HistorialMovimientos (id_persona, id_desplazamiento, accion, descripcion, usuario_registro)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await this.db.execute(query, [id_persona, id_desplazamiento, accion, descripcion, usuario_registro]);
        return result.insertId;
    }

    async getHistorialById(id) {
        const query = `
            SELECT hm.*, u.nombres, u.apellidos, d.fecha_inicio, d.fecha_fin
            FROM HistorialMovimientos hm
            LEFT JOIN Personas u ON hm.id_persona = u.id_persona
            LEFT JOIN Desplazamiento d ON hm.id_desplazamiento = d.id_desplazamiento
            WHERE hm.id_historial = ?
        `;
        const [rows] = await this.db.execute(query, [id]);
        return rows[0] || null;
    }

    async deleteHistorial(id) {
        const query = 'DELETE FROM HistorialMovimientos WHERE id_historial = ?';
        await this.db.execute(query, [id]);
    }
}

module.exports = HistorialMovimientosService;
