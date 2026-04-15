class BienService {
    constructor(db) {
        this.db = db;
    }

    async getAllBienes(userId, isAdmin = false) {
        let query = `
            SELECT b.*, 
                   tb.nombre as tipo_bien_nombre,
                   CONCAT(p.nombres, ' ', p.apellidos) AS owner_nombre
            FROM Bien b 
            LEFT JOIN TipoBien tb ON b.id_tipo_bien = tb.id_tipo_bien
            LEFT JOIN Personas p ON b.id_persona = p.id_persona
        `;
        let params = [];
        
        if (!isAdmin) {
            query += ' WHERE b.id_persona = ?';
            params.push(userId);
        }

        query += ' ORDER BY b.fecha_registro DESC';

        const [rows] = await this.db.execute(query, params);
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
        let { nombre, descripcion, valor, id_tipo_bien, codigo } = data;
        
        if (!nombre || !nombre.trim()) {
            throw new Error('El nombre del bien es obligatorio.');
        }

        nombre = nombre.trim();
        
        // Validar unicidad por nombre (Requerimiento Usuario)
        const [existing] = await this.db.execute('SELECT id_bien FROM Bien WHERE nombre = ?', [nombre]);
        if (existing.length > 0) {
            throw new Error(`El nombre de bien "${nombre}" ya está registrado.`);
        }

        const query = `
            INSERT INTO Bien (nombre, descripcion, valor, id_tipo_bien, id_persona, codigo) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await this.db.execute(query, [
            nombre, 
            descripcion || null, 
            valor ? Number(valor) : null, 
            id_tipo_bien ? Number(id_tipo_bien) : null, 
            userId, 
            codigo || null
        ]);
        return result.insertId;
    }

    async updateBien(id, data, userId) {
        let { nombre, descripcion, valor, id_tipo_bien, estado, codigo } = data;
        const existing = await this.getBienById(id, userId);
        if (!existing) {
            throw new Error('Bien no encontrado o no tienes permisos');
        }

        if (nombre && nombre.trim() !== existing.nombre) {
            nombre = nombre.trim();
            const [duplicate] = await this.db.execute('SELECT id_bien FROM Bien WHERE nombre = ? AND id_bien != ?', [nombre, id]);
            if (duplicate.length > 0) {
                throw new Error(`El nombre "${nombre}" ya está en uso por otro bien.`);
            }
        }

        const query = `
            UPDATE Bien 
            SET nombre = ?, descripcion = ?, valor = ?, id_tipo_bien = ?, estado = ?, codigo = ? 
            WHERE id_bien = ?
        `;
        await this.db.execute(query, [
            nombre ? nombre.trim() : existing.nombre, 
            descripcion || null, 
            valor ? Number(valor) : null, 
            id_tipo_bien ? Number(id_tipo_bien) : null, 
            estado, 
            codigo || null, 
            id
        ]);
    }

    async getTiposBien() {
        const query = 'SELECT id_tipo_bien, nombre FROM TipoBien ORDER BY nombre';
        const [rows] = await this.db.execute(query);
        return rows;
    }

    async importBienes(bienes, userId) {
        if (!Array.isArray(bienes) || bienes.length === 0) {
            return { imported: 0, skipped: 0, duplicates: [] };
        }

        let imported = 0;
        let skipped = 0;
        const duplicates = [];

        for (const bien of bienes) {
            try {
                if (!bien.nombre) {
                    skipped++;
                    continue;
                }
                
                const cleanName = bien.nombre.trim();
                const [existing] = await this.db.execute('SELECT id_bien FROM Bien WHERE nombre = ?', [cleanName]);
                if (existing.length > 0) {
                    skipped++;
                    duplicates.push(cleanName);
                    continue;
                }

                await this.createBien(bien, userId);
                imported++;
            } catch (err) {
                console.error(`Error importando bien ${bien.nombre}:`, err.message);
                skipped++;
            }
        }

        return { imported, skipped, duplicates };
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
