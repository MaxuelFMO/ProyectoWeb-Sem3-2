class DesplazamientoService {
    constructor(db) {
        this.db = db;
    }

    async getAllDesplazamientos(userId) {
        const query = `
            SELECT
                d.*, 
                m.nombre AS motivo,
                e.nombre AS estado,
                o.id_persona AS origen_id,
                CONCAT(o.nombres, ' ', o.apellidos) AS origen_nombre,
                r.id_persona AS destino_id,
                CONCAT(r.nombres, ' ', r.apellidos) AS destino_nombre,
                GROUP_CONCAT(b.nombre SEPARATOR ', ') AS bienes_nombres,
                GROUP_CONCAT(db.id_bien) AS bienes_ids,
                GROUP_CONCAT(b.valor SEPARATOR ', ') AS bienes_valores
            FROM Desplazamiento d
            LEFT JOIN MotivoDesplazamiento m ON d.id_motivo = m.id_motivo
            LEFT JOIN EstadoDesplazamiento e ON d.id_estado = e.id_estado
            LEFT JOIN Personas o ON d.id_persona_origen = o.id_persona
            LEFT JOIN Personas r ON d.id_persona_destino = r.id_persona
            LEFT JOIN DesplazamientoBien db ON d.id_desplazamiento = db.id_desplazamiento
            LEFT JOIN Bien b ON db.id_bien = b.id_bien
            WHERE d.id_persona_origen = ? OR d.id_persona_destino = ?
            GROUP BY d.id_desplazamiento
            ORDER BY d.fecha_registro DESC
        `;
        const [rows] = await this.db.execute(query, [userId, userId]);
        return rows;
    }

    async getDesplazamientoById(id, userId) {
        const query = `
            SELECT
                d.*, 
                m.nombre AS motivo,
                e.nombre AS estado,
                o.id_persona AS origen_id,
                CONCAT(o.nombres, ' ', o.apellidos) AS origen_nombre,
                r.id_persona AS destino_id,
                CONCAT(r.nombres, ' ', r.apellidos) AS destino_nombre,
                GROUP_CONCAT(b.nombre SEPARATOR ', ') AS bienes_nombres,
                GROUP_CONCAT(db.id_bien) AS bienes_ids,
                GROUP_CONCAT(b.valor SEPARATOR ', ') AS bienes_valores
            FROM Desplazamiento d
            LEFT JOIN MotivoDesplazamiento m ON d.id_motivo = m.id_motivo
            LEFT JOIN EstadoDesplazamiento e ON d.id_estado = e.id_estado
            LEFT JOIN Personas o ON d.id_persona_origen = o.id_persona
            LEFT JOIN Personas r ON d.id_persona_destino = r.id_persona
            LEFT JOIN DesplazamientoBien db ON d.id_desplazamiento = db.id_desplazamiento
            LEFT JOIN Bien b ON db.id_bien = b.id_bien
            WHERE d.id_desplazamiento = ? AND (d.id_persona_origen = ? OR d.id_persona_destino = ?)
            GROUP BY d.id_desplazamiento
        `;
        const [rows] = await this.db.execute(query, [id, userId, userId]);
        return rows[0] || null;
    }

    async createDesplazamiento(data, userId) {
        const {
            id_persona_destino,
            id_motivo,
            bienes_ids = [],
        } = data;

        if (!id_persona_destino || !id_motivo || !Array.isArray(bienes_ids) || bienes_ids.length === 0) {
            throw new Error('Datos de desplazamiento incompletos');
        }

        const placeholders = bienes_ids.map(() => '?').join(',');
        const [existingBienes] = await this.db.execute(
            `SELECT id_bien FROM Bien WHERE id_bien IN (${placeholders}) AND id_persona = ?`,
            [...bienes_ids, userId]
        );

        if (!existingBienes || existingBienes.length !== bienes_ids.length) {
            throw new Error('Algunos bienes no pertenecen al usuario o no existen');
        }

        const motivoRows = await this.db.execute(
            'SELECT nombre FROM MotivoDesplazamiento WHERE id_motivo = ?',
            [id_motivo]
        );
        const motivoNombre = motivoRows[0]?.[0]?.nombre || null;

        const [result] = await this.db.execute(
            'INSERT INTO Desplazamiento (fecha_inicio, id_motivo, id_estado, id_persona_origen, id_persona_destino, razon) VALUES (CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)',
            [id_motivo, 3, userId, id_persona_destino, motivoNombre]
        );

        const desplazamientoId = result.insertId;

        const insertValues = bienes_ids.map((bienId) => [desplazamientoId, bienId]);
        await this.db.query(
            'INSERT INTO DesplazamientoBien (id_desplazamiento, id_bien) VALUES ?',
            [insertValues]
        );

        return desplazamientoId;
    }

    async updateDesplazamiento(id, data, userId) {
        const { id_estado } = data;
        const [existingRows] = await this.db.execute(
            'SELECT * FROM Desplazamiento WHERE id_desplazamiento = ? AND id_persona_destino = ?',
            [id, userId]
        );

        const existing = existingRows[0];
        if (!existing) {
            throw new Error('No autorizado o desplazamiento no encontrado');
        }

        if (![1, 3].includes(Number(id_estado))) {
            throw new Error('Estado no válido');
        }

        await this.db.execute('UPDATE Desplazamiento SET id_estado = ? WHERE id_desplazamiento = ?', [id_estado, id]);

        if (Number(id_estado) === 3) {
            const [bienesRows] = await this.db.execute('SELECT id_bien FROM DesplazamientoBien WHERE id_desplazamiento = ?', [id]);
            const bienesIds = bienesRows.map((row) => row.id_bien);
            if (bienesIds.length > 0) {
                const placeholders = bienesIds.map(() => '?').join(',');
                await this.db.execute(
                    `UPDATE Bien SET id_persona = ? WHERE id_bien IN (${placeholders})`,
                    [userId, ...bienesIds]
                );
            }
        }
    }

    async deleteDesplazamiento(id, userId) {
        const [existingRows] = await this.db.execute(
            'SELECT * FROM Desplazamiento WHERE id_desplazamiento = ? AND id_persona_origen = ? AND id_estado = 2',
            [id, userId]
        );

        if (!existingRows || existingRows.length === 0) {
            throw new Error('No autorizado o desplazamiento no puede eliminarse');
        }

        await this.db.execute('DELETE FROM DesplazamientoBien WHERE id_desplazamiento = ?', [id]);
        await this.db.execute('DELETE FROM Desplazamiento WHERE id_desplazamiento = ?', [id]);
    }
}

module.exports = DesplazamientoService;
