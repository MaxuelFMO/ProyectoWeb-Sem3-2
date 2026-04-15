const bcrypt = require('bcryptjs');

const seedDatabase = async (db) => {
    try {
        console.log('--- Iniciando Seed de Base de Datos (Estados Completos) ---');

        // --- 1. USUARIOS ---
        const passwordHash = await bcrypt.hash('password123', 10);
        const usersToSeed = [
            { nombres: 'Admin', apellidos: 'Principal', correo: 'admin@sistema.com', id_tipo_cargo: 1 },
            { nombres: 'Sofia', apellidos: 'Gerente', correo: 'sofia@sistema.com', id_tipo_cargo: 1 },
            { nombres: 'Juan', apellidos: 'Pérez', correo: 'juan@sistema.com', id_tipo_cargo: 2 },
            { nombres: 'Maria', apellidos: 'García', correo: 'maria@sistema.com', id_tipo_cargo: 2 },
            { nombres: 'Pedro', apellidos: 'López', correo: 'pedro@sistema.com', id_tipo_cargo: 2 },
            { nombres: 'Ana', apellidos: 'Martínez', correo: 'ana@sistema.com', id_tipo_cargo: 2 },
        ];

        const userIds = {};
        for (const u of usersToSeed) {
            const [existing] = await db.query('SELECT id_persona FROM Personas WHERE correo = ?', [u.correo]);
            if (existing.length === 0) {
                const [result] = await db.query(
                    'INSERT INTO Personas (nombres, apellidos, correo, id_tipo_cargo, password_hash, estado) VALUES (?, ?, ?, ?, ?, TRUE)',
                    [u.nombres, u.apellidos, u.correo, u.id_tipo_cargo, passwordHash]
                );
                userIds[u.nombres.toLowerCase()] = result.insertId;
            } else {
                userIds[u.nombres.toLowerCase()] = existing[0].id_persona;
            }
        }

        // --- 2. BIENES ---
        const bienesData = [
            { nombre: 'Laptop Pro 14', owner: 'juan' },
            { nombre: 'Monitor curvo 34', owner: 'juan' },
            { nombre: 'Silla Mesh Plus', owner: 'maria' },
            { nombre: 'iPad Air 5', owner: 'pedro' },
            { nombre: 'Cámara DSLR Z6', owner: 'ana' },
            { nombre: 'Scanner Industrial', owner: 'sofia' },
        ];

        const bienIds = {};
        for (const b of bienesData) {
            const [existing] = await db.query('SELECT id_bien FROM Bien WHERE nombre = ?', [b.nombre]);
            if (existing.length === 0) {
                const [res] = await db.query(
                    'INSERT INTO Bien (nombre, valor, id_tipo_bien, id_persona, estado) VALUES (?, ?, 1, ?, TRUE)',
                    [b.nombre, 1000, userIds[b.owner]]
                );
                bienIds[b.nombre] = res.insertId;
            } else {
                bienIds[b.nombre] = existing[0].id_bien;
            }
        }

        // --- 3. DESPLAZAMIENTOS Y HISTORIAS (Todos los estados) ---
        
        // Función auxiliar para insertar historia
        const addHistory = async (userId, desplId, accion, desc) => {
            await db.query(
                'INSERT INTO HistorialMovimientos (id_persona, id_desplazamiento, accion, descripcion, usuario_registro) VALUES (?, ?, ?, ?, ?)',
                [userId, desplId, accion, desc, 'sistema@seed.local']
            );
        };

        const scenarioData = [
            {
                tag: 'COMPLETADO',
                motivo: 1, // Cambio residencia
                estado: 4, // Completado
                origen: 'juan',
                destino: 'maria',
                razon: 'Mudanza a nueva sucursal Norte',
                items: ['Laptop Pro 14', 'Monitor curvo 34'],
                steps: [
                    { action: 'Creado', desc: 'Juan inició el traslado de equipo' },
                    { action: 'Actualizado', desc: 'Maria confirmó la recepción de los bienes' },
                    { action: 'Completado', desc: 'Traslado finalizado exitosamente' }
                ]
            },
            {
                tag: 'EN PROCESO',
                motivo: 2, // Donativo
                estado: 3, // En Proceso
                origen: 'maria',
                destino: 'pedro',
                razon: 'Asignación de mobiliario ergonómico',
                items: ['Silla Mesh Plus'],
                steps: [
                    { action: 'Creado', desc: 'Maria solicitó el envío de la silla a Pedro' }
                ]
            },
            {
                tag: 'RECHAZADO',
                motivo: 3, // Renuncia
                estado: 1, // Rechazado
                origen: 'pedro',
                destino: 'ana',
                razon: 'Préstamo de tablet para inventario',
                items: ['iPad Air 5'],
                steps: [
                    { action: 'Creado', desc: 'Pedro solicitó el préstamo' },
                    { action: 'Rechazado', desc: 'Ana rechazó la solicitud por falta de stock disponible' }
                ]
            },
            {
                tag: 'CANCELADO',
                motivo: 4, // Cambio área
                estado: 2, // Cancelado
                origen: 'ana',
                destino: 'juan',
                razon: 'Envío de cámara para mantenimiento',
                items: ['Cámara DSLR Z6'],
                steps: [
                    { action: 'Creado', desc: 'Ana inició el proceso de envío' },
                    { action: 'Cancelado', desc: 'Ana canceló la solicitud: se realizará mantenimiento local' }
                ]
            }
        ];

        for (const sc of scenarioData) {
            const [existing] = await db.query('SELECT id_desplazamiento FROM Desplazamiento WHERE razon = ?', [sc.razon]);
            let desplId;
            
            if (existing.length === 0) {
                const [res] = await db.query(
                    'INSERT INTO Desplazamiento (fecha_inicio, id_motivo, id_estado, id_persona_origen, id_persona_destino, razon) VALUES (NOW(), ?, ?, ?, ?, ?)',
                    [sc.motivo, sc.estado, userIds[sc.origen], userIds[sc.destino], sc.razon]
                );
                desplId = res.insertId;

                for (const itemName of sc.items) {
                    await db.query('INSERT INTO DesplazamientoBien (id_desplazamiento, id_bien) VALUES (?, ?)', [desplId, bienIds[itemName]]);
                    if (sc.estado === 4) {
                        await db.query('UPDATE Bien SET id_persona = ? WHERE id_bien = ?', [userIds[sc.destino], bienIds[itemName]]);
                    }
                }
                console.log(`✓ Escenario ${sc.tag} creado.`);
            } else {
                desplId = existing[0].id_desplazamiento;
                console.log(`- Escenario ${sc.tag} ya existe.`);
            }

            // Asegurar que las historias existan para este escenario
            for (const step of sc.steps) {
                const [histExp] = await db.query(
                    'SELECT id_historial FROM HistorialMovimientos WHERE id_desplazamiento = ? AND accion = ? AND descripcion = ?',
                    [desplId, step.action, step.desc]
                );
                if (histExp.length === 0) {
                    await addHistory(userIds[sc.origen], desplId, step.action, step.desc);
                }
            }
        }

        console.log('--- Seed de Escenarios de Estado Completado ---');
    } catch (err) {
        console.error('Error en el Seed de estados:', err.message);
    }
};

module.exports = seedDatabase;
