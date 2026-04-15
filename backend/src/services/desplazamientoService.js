class DesplazamientoService {
    constructor(db) {
        this.db = db;
    }

    async getAllDesplazamientos(userId, isAdmin = false, filters = {}) {
        const { id_persona, id_motivo, id_estado, fecha_inicio, fecha_fin, search } = filters;
        let whereClauses = [];
        let params = [];

        if (!isAdmin) {
            whereClauses.push('(d.id_persona_origen = ? OR d.id_persona_destino = ?)');
            params.push(userId, userId);
        } else if (id_persona) {
            whereClauses.push('(d.id_persona_origen = ? OR d.id_persona_destino = ?)');
            params.push(id_persona, id_persona);
        }

        if (id_motivo) {
            whereClauses.push('d.id_motivo = ?');
            params.push(id_motivo);
        }

        if (id_estado) {
            whereClauses.push('d.id_estado = ?');
            params.push(id_estado);
        }

        if (fecha_inicio) {
            whereClauses.push('d.fecha_inicio >= ?');
            params.push(fecha_inicio);
        }

        if (fecha_fin) {
            whereClauses.push('d.fecha_inicio <= ?');
            params.push(fecha_fin);
        }

        if (search) {
            whereClauses.push('(o.nombres LIKE ? OR r.nombres LIKE ? OR b.nombre LIKE ?)');
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const query = `
            SELECT
                d.*, 
                m.nombre AS motivo,
                e.nombre AS estado,
                o.id_persona AS origen_id,
                CONCAT(o.nombres, ' ', o.apellidos) AS origen_nombre,
                r.id_persona AS destino_id,
                CONCAT(r.nombres, ' ', r.apellidos) AS destino_nombre,
                IFNULL(GROUP_CONCAT(DISTINCT b.nombre SEPARATOR ', '), 'Sin bienes') AS bienes_nombres,
                GROUP_CONCAT(DISTINCT db.id_bien) AS bienes_ids,
                IFNULL(SUM(DISTINCT b.valor), 0) AS valor_total
            FROM Desplazamiento d
            LEFT JOIN MotivoDesplazamiento m ON d.id_motivo = m.id_motivo
            LEFT JOIN EstadoDesplazamiento e ON d.id_estado = e.id_estado
            LEFT JOIN Personas o ON d.id_persona_origen = o.id_persona
            LEFT JOIN Personas r ON d.id_persona_destino = r.id_persona
            LEFT JOIN DesplazamientoBien db ON d.id_desplazamiento = db.id_desplazamiento
            LEFT JOIN Bien b ON db.id_bien = b.id_bien
            ${whereClause}
            GROUP BY d.id_desplazamiento
            ORDER BY d.fecha_registro DESC
        `;
        const [rows] = await this.db.execute(query, params);
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
                IFNULL(SUM(b.valor), 0) AS valor_total
            FROM Desplazamiento d
            LEFT JOIN MotivoDesplazamiento m ON d.id_motivo = m.id_motivo
            LEFT JOIN EstadoDesplazamiento e ON d.id_estado = e.id_estado
            LEFT JOIN Personas o ON d.id_persona_origen = o.id_persona
            LEFT JOIN Personas r ON d.id_persona_destino = r.id_persona
            LEFT JOIN DesplazamientoBien db ON d.id_desplazamiento = db.id_desplazamiento
            LEFT JOIN Bien b ON db.id_bien = b.id_bien
            WHERE d.id_desplazamiento = ?
            GROUP BY d.id_desplazamiento
        `;
        const [rows] = await this.db.execute(query, [id]);
        return rows[0] || null;
    }

    async createDesplazamiento(data, userId) {
        const {
            id_persona_destino,
            id_motivo,
            bienes_ids = [],
            razon = ''
        } = data;

        if (!id_persona_destino || !id_motivo || !Array.isArray(bienes_ids) || bienes_ids.length === 0) {
            throw new Error('Datos de desplazamiento incompletos');
        }

        // Verificar propiedad de los bienes
        const placeholders = bienes_ids.map(() => '?').join(',');
        const [existingBienes] = await this.db.execute(
            `SELECT id_bien FROM Bien WHERE id_bien IN (${placeholders}) AND id_persona = ?`,
            [...bienes_ids, userId]
        );

        if (!existingBienes || existingBienes.length !== bienes_ids.length) {
            throw new Error('Algunos bienes no pertenecen al usuario o no existen');
        }

        const [result] = await this.db.execute(
            'INSERT INTO Desplazamiento (fecha_inicio, id_motivo, id_estado, id_persona_origen, id_persona_destino, razon) VALUES (CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)',
            [id_motivo, 3, userId, id_persona_destino, razon]
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
        
        // Verificar roles
        const [userRoleRows] = await this.db.execute(
            'SELECT id_tipo_cargo FROM Personas WHERE id_persona = ?',
            [userId]
        );
        const isAdmin = userRoleRows[0]?.id_tipo_cargo === 1;

        const [existingRows] = await this.db.execute(
            'SELECT * FROM Desplazamiento WHERE id_desplazamiento = ?',
            [id]
        );
        const existing = existingRows[0];

        if (!existing) {
            throw new Error('Desplazamiento no encontrado');
        }

        // Validar permisos de cambio de estado
        const isDestination = Number(existing.id_persona_destino) === Number(userId);
        const isOrigin = Number(existing.id_persona_origen) === Number(userId);

        if (!isAdmin) {
            if (Number(id_estado) === 2) { // Cancelar
                if (!isOrigin) throw new Error('Solo el origen puede cancelar el desplazamiento');
            } else if ([1, 4].includes(Number(id_estado))) { // Rechazar o Completar
                if (!isDestination) throw new Error('Solo el destino puede confirmar o rechazar el desplazamiento');
            } else {
                throw new Error('No autorizado para este cambio de estado');
            }
        }

        await this.db.execute('UPDATE Desplazamiento SET id_estado = ? WHERE id_desplazamiento = ?', [id_estado, id]);

        // INTEGRACIÓN: Si se completa, transferir propiedad de los bienes
        if (Number(id_estado) === 4) {
            const [bienesRows] = await this.db.execute('SELECT id_bien FROM DesplazamientoBien WHERE id_desplazamiento = ?', [id]);
            const bienesIds = bienesRows.map((row) => row.id_bien);
            if (bienesIds.length > 0) {
                const placeholders = bienesIds.map(() => '?').join(',');
                await this.db.execute(
                    `UPDATE Bien SET id_persona = ? WHERE id_bien IN (${placeholders})`,
                    [existing.id_persona_destino, ...bienesIds]
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
            throw new Error('No autorizado o el desplazamiento no está en estado cancelado');
        }

        await this.db.execute('DELETE FROM DesplazamientoBien WHERE id_desplazamiento = ?', [id]);
        await this.db.execute('DELETE FROM Desplazamiento WHERE id_desplazamiento = ?', [id]);
    }
}

module.exports = DesplazamientoService;
