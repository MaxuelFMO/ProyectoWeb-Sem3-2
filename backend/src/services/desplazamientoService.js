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

        if (!id_persona_destino) throw new Error('El destinatario es obligatorio (no se encontró el usuario).');
        if (!id_motivo) throw new Error('El motivo de desplazamiento es obligatorio.');
        if (!Array.isArray(bienes_ids) || bienes_ids.length === 0) throw new Error('Debe seleccionar al menos un bien para desplazar.');

        if (Number(userId) === Number(id_persona_destino)) {
            throw new Error('No puedes realizar un desplazamiento hacia ti mismo.');
        }

        const cleanBienesIds = bienes_ids.map(id => Number(id)).filter(id => !isNaN(id));
        
        // Verificar roles
        const [userRoleRows] = await this.db.execute('SELECT id_tipo_cargo FROM Personas WHERE id_persona = ?', [userId]);
        const isAdmin = userRoleRows[0]?.id_tipo_cargo === 1;

        // Verificar propiedad (Solo si no es admin)
        const placeholders = cleanBienesIds.map(() => '?').join(',');
        const queryCheck = isAdmin 
            ? `SELECT id_bien, id_persona FROM Bien WHERE id_bien IN (${placeholders})`
            : `SELECT id_bien, id_persona FROM Bien WHERE id_bien IN (${placeholders}) AND id_persona = ?`;
        
        const queryParams = isAdmin ? [...cleanBienesIds] : [...cleanBienesIds, userId];
        const [existingBienes] = await this.db.execute(queryCheck, queryParams);

        if (!existingBienes || existingBienes.length !== cleanBienesIds.length) {
            throw new Error('Uno o más bienes seleccionados no son válidos o ya no están disponibles.');
        }

        // Si es admin, el origen REAL del desplazamiento es el dueño actual del primer bien (simplificación)
        // o mantenemos al Admin como origen legal del trámite.
        // El requerimiento dice id_persona_origen. Usaremos al que inicia el trámite (el Admin).
        
        const [result] = await this.db.execute(
            'INSERT INTO Desplazamiento (fecha_inicio, id_motivo, id_estado, id_persona_origen, id_persona_destino, razon) VALUES (CURRENT_TIMESTAMP, ?, 3, ?, ?, ?)',
            [Number(id_motivo), Number(userId), Number(id_persona_destino), razon || '']
        );

        const desplazamientoId = result.insertId;
        const insertValues = cleanBienesIds.map((bienId) => [desplazamientoId, bienId]);
        
        try {
            // Bulk insert
            await this.db.query('INSERT INTO DesplazamientoBien (id_desplazamiento, id_bien) VALUES ?', [insertValues]);
        } catch (dbErr) {
            console.error('Error insertando DesplazamientoBien:', dbErr);
            throw new Error('Error al vincular los bienes con el desplazamiento.');
        }

        // LOG AUTOMÁTICO EN HISTORIAL
        try {
            const [uRows] = await this.db.execute('SELECT correo FROM Personas WHERE id_persona = ?', [userId]);
            const creatorEmail = uRows && uRows[0] ? uRows[0].correo : 'sistema';

            await this.db.execute(
                'INSERT INTO HistorialMovimientos (id_persona, id_desplazamiento, accion, descripcion, usuario_registro) VALUES (?, ?, ?, ?, ?)',
                [userId, desplazamientoId, 'Solicitud Generada', `Inició un proceso de desplazamiento por: ${razon || 'Sin razón específica'}`, creatorEmail]
            );
        } catch (histErr) {
            console.error('Historial Error (Non-blocking):', histErr.message);
        }

        return desplazamientoId;
    }

    async updateDesplazamiento(id, data, userId) {
        const { id_estado } = data;
        if (!id_estado) throw new Error('Estado no proporcionado');

        const [existingRows] = await this.db.execute('SELECT * FROM Desplazamiento WHERE id_desplazamiento = ?', [id]);
        const existing = existingRows[0];
        if (!existing) throw new Error('Desplazamiento no encontrado');

        // Roles
        const [userRows] = await this.db.execute('SELECT id_tipo_cargo, correo FROM Personas WHERE id_persona = ?', [userId]);
        const isAdmin = userRows[0]?.id_tipo_cargo === 1;
        const userEmail = userRows[0]?.correo || 'sistema';

        const isDestination = Number(existing.id_persona_destino) === Number(userId);
        const isOrigin = Number(existing.id_persona_origen) === Number(userId);

        if (!isAdmin) {
            if (Number(id_estado) === 2) { // Cancelar
                if (!isOrigin) throw new Error('Solo el origen puede cancelar');
            } else if ([1, 4].includes(Number(id_estado))) { // Rechazar o Completar
                if (!isDestination) throw new Error('Solo el destinatario puede aceptar o rechazar');
            } else {
                throw new Error('Operación no permitida para tu rol');
            }
        }

        await this.db.execute(
            'UPDATE Desplazamiento SET id_estado = ?, fecha_fin = ? WHERE id_desplazamiento = ?', 
            [id_estado, Number(id_estado) === 4 ? new Date() : null, id]
        );

        // LOG AUTOMÁTICO
        let accion = 'Actualización de Estado';
        let desc = `Estado ajustado a ID: ${id_estado}`;

        if (Number(id_estado) === 4) {
            accion = 'Solicitud Aceptada';
            desc = 'El destinatario aceptó los bienes. Propiedad transferida.';
            
            // Transferir bienes
            const [bienesRows] = await this.db.execute('SELECT id_bien FROM DesplazamientoBien WHERE id_desplazamiento = ?', [id]);
            const bienesIds = bienesRows.map((row) => row.id_bien);
            if (bienesIds.length > 0) {
                const placeholders = bienesIds.map(() => '?').join(',');
                await this.db.execute(
                    `UPDATE Bien SET id_persona = ? WHERE id_bien IN (${placeholders})`,
                    [existing.id_persona_destino, ...bienesIds]
                );
            }
        } else if (Number(id_estado) === 1) {
            accion = 'Solicitud Rechazada';
            desc = 'El destinatario rechazó la solicitud de desplazamiento.';
        } else if (Number(id_estado) === 2) {
            accion = 'Solicitud Cancelada';
            desc = 'El origen o un administrador canceló el proceso.';
        }

        await this.db.execute(
            'INSERT INTO HistorialMovimientos (id_persona, id_desplazamiento, accion, descripcion, usuario_registro) VALUES (?, ?, ?, ?, ?)',
            [userId, id, accion, desc, userEmail]
        );
    }

    async deleteDesplazamiento(id, userId) {
        const [existingRows] = await this.db.execute(
            'SELECT * FROM Desplazamiento WHERE id_desplazamiento = ? AND id_persona_origen = ? AND id_estado = 2',
            [id, userId]
        );

        if (!existingRows || existingRows.length === 0) {
            throw new Error('No autorizado o el desplazamiento no está cancelado');
        }

        await this.db.execute('DELETE FROM DesplazamientoBien WHERE id_desplazamiento = ?', [id]);
        await this.db.execute('DELETE FROM Desplazamiento WHERE id_desplazamiento = ?', [id]);
    }
}

module.exports = DesplazamientoService;
