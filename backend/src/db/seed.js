const bcrypt = require('bcryptjs');

const seedDatabase = async (db) => {
    try {
        // Verificar si el usuario demo ya existe
        const [existing] = await db.query(
            'SELECT id_persona FROM Personas WHERE nombres = ?',
            ['demo']
        );

        if (existing.length > 0) {
            console.log('✓ Usuario demo ya existe');
            
            // Verificar si ya hay desplazamientos
            const [existingDesplazamientos] = await db.query(
                'SELECT COUNT(*) as count FROM Desplazamiento'
            );
            
            if (existingDesplazamientos[0].count > 0) {
                console.log('✓ Desplazamientos de prueba ya existen');
                return;
            }

            // El usuario demo existe, ahora crear desplazamientos de prueba
            const demoPerson = existing[0];
            const demoId = demoPerson.id_persona;

            // Crear otro usuario para desplazamientos
            const [recipient] = await db.query(
                'SELECT id_persona FROM Personas WHERE nombres != ?',
                ['demo']
            );

            let recipientId = null;
            if (!recipient || recipient.length === 0) {
                // Crear usuario destinatario
                const hashedPassword = await bcrypt.hash('test', 10);
                const [resultRecipient] = await db.query(
                    'INSERT INTO Personas (nombres, apellidos, correo, id_tipo_cargo, password_hash, estado) VALUES (?, ?, ?, ?, ?, TRUE)',
                    ['Juan', 'Pérez', 'juan@local.com', 2, hashedPassword]
                );
                recipientId = resultRecipient.insertId;
            } else {
                recipientId = recipient[0].id_persona;
            }

            // Crear bienes de prueba para el demo
            const [existingBienes] = await db.query(
                'SELECT COUNT(*) as count FROM Bien WHERE id_persona = ?',
                [demoId]
            );

            let bien1Id, bien2Id, bien3Id;

            if (existingBienes[0].count === 0) {
                // Crear bienes
                const [res1] = await db.query(
                    'INSERT INTO Bien (nombre, descripcion, valor, id_tipo_bien, id_persona, estado) VALUES (?, ?, ?, ?, ?, TRUE)',
                    ['Laptop Dell', 'Laptop de trabajo', 1200.00, 1, demoId]
                );
                bien1Id = res1.insertId;

                const [res2] = await db.query(
                    'INSERT INTO Bien (nombre, descripcion, valor, id_tipo_bien, id_persona, estado) VALUES (?, ?, ?, ?, ?, TRUE)',
                    ['Monitor LG', 'Monitor 27 pulgadas', 350.00, 1, demoId]
                );
                bien2Id = res2.insertId;

                const [res3] = await db.query(
                    'INSERT INTO Bien (nombre, descripcion, valor, id_tipo_bien, id_persona, estado) VALUES (?, ?, ?, ?, ?, TRUE)',
                    ['Escritorio', 'Escritorio de madera', 500.00, 5, demoId]
                );
                bien3Id = res3.insertId;
            } else {
                const [bienes] = await db.query(
                    'SELECT id_bien FROM Bien WHERE id_persona = ? LIMIT 3',
                    [demoId]
                );
                bien1Id = bienes[0].id_bien;
                bien2Id = bienes[1]?.id_bien || bien1Id;
                bien3Id = bienes[2]?.id_bien || bien1Id;
            }

            // Crear desplazamientos de prueba
            const [desplazamiento1] = await db.query(
                'INSERT INTO Desplazamiento (fecha_inicio, fecha_fin, id_motivo, id_estado, id_persona_origen, id_persona_destino, razon) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    new Date('2026-04-10 10:00:00'),
                    new Date('2026-04-12 15:30:00'),
                    1, // Cambio de residencia
                    4, // Completado
                    demoId,
                    recipientId,
                    'Traslado a nueva oficina'
                ]
            );

            const [desplazamiento2] = await db.query(
                'INSERT INTO Desplazamiento (fecha_inicio, id_motivo, id_estado, id_persona_origen, id_persona_destino, razon) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    new Date('2026-04-14 09:00:00'),
                    2, // Donativo
                    3, // En Proceso
                    demoId,
                    recipientId,
                    'Donación de materiales'
                ]
            );

            // Asociar bienes con desplazamientos
            await db.query(
                'INSERT INTO DesplazamientoBien (id_desplazamiento, id_bien) VALUES (?, ?), (?, ?), (?, ?)',
                [
                    desplazamiento1.insertId, bien1Id,
                    desplazamiento1.insertId, bien2Id,
                    desplazamiento2.insertId, bien3Id
                ]
            );

            // Crear registros de historial
            await db.query(
                'INSERT INTO HistorialMovimientos (id_persona, id_desplazamiento, accion, descripcion, usuario_registro) VALUES (?, ?, ?, ?, ?)',
                [
                    demoId,
                    desplazamiento1.insertId,
                    'Creados',
                    'Desplazamiento creado',
                    'demo'
                ]
            );

            await db.query(
                'INSERT INTO HistorialMovimientos (id_persona, id_desplazamiento, accion, descripcion, usuario_registro) VALUES (?, ?, ?, ?, ?)',
                [
                    recipientId,
                    desplazamiento1.insertId,
                    'Actualizados',
                    'Desplazamiento completado',
                    'demo'
                ]
            );

            console.log('✓ Datos de prueba creados: Desplazamientos y Historial');
            return;
        }

        // Hash para contraseña "demo"
        const hashedPassword = await bcrypt.hash('demo', 10);

        // Insertar usuario demo
        const [resultUser] = await db.query(
            'INSERT INTO Personas (nombres, apellidos, correo, id_tipo_cargo, password_hash, estado) VALUES (?, ?, ?, ?, ?, TRUE)',
            ['demo', 'Usuario de Demostración', 'demo@local.com', 1, hashedPassword]
        );

        const demoId = resultUser.insertId;

        // Crear usuario destinatario
        const hashPassword2 = await bcrypt.hash('test', 10);
        const [resultRecipient] = await db.query(
            'INSERT INTO Personas (nombres, apellidos, correo, id_tipo_cargo, password_hash, estado) VALUES (?, ?, ?, ?, ?, TRUE)',
            ['Juan', 'Pérez', 'juan@local.com', 2, hashPassword2]
        );

        const recipientId = resultRecipient.insertId;

        // Crear bienes de prueba
        const [res1] = await db.query(
            'INSERT INTO Bien (nombre, descripcion, valor, id_tipo_bien, id_persona, estado) VALUES (?, ?, ?, ?, ?, TRUE)',
            ['Laptop Dell', 'Laptop de trabajo', 1200.00, 1, demoId]
        );
        const bien1Id = res1.insertId;

        const [res2] = await db.query(
            'INSERT INTO Bien (nombre, descripcion, valor, id_tipo_bien, id_persona, estado) VALUES (?, ?, ?, ?, ?, TRUE)',
            ['Monitor LG', 'Monitor 27 pulgadas', 350.00, 1, demoId]
        );
        const bien2Id = res2.insertId;

        const [res3] = await db.query(
            'INSERT INTO Bien (nombre, descripcion, valor, id_tipo_bien, id_persona, estado) VALUES (?, ?, ?, ?, ?, TRUE)',
            ['Escritorio', 'Escritorio de madera', 500.00, 5, demoId]
        );
        const bien3Id = res3.insertId;

        // Crear desplazamientos de prueba
        const [desplazamiento1] = await db.query(
            'INSERT INTO Desplazamiento (fecha_inicio, fecha_fin, id_motivo, id_estado, id_persona_origen, id_persona_destino, razon) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                new Date('2026-04-10 10:00:00'),
                new Date('2026-04-12 15:30:00'),
                1, // Cambio de residencia
                4, // Completado
                demoId,
                recipientId,
                'Traslado a nueva oficina'
            ]
        );

        const [desplazamiento2] = await db.query(
            'INSERT INTO Desplazamiento (fecha_inicio, id_motivo, id_estado, id_persona_origen, id_persona_destino, razon) VALUES (?, ?, ?, ?, ?, ?)',
            [
                new Date('2026-04-14 09:00:00'),
                2, // Donativo
                3, // En Proceso
                demoId,
                recipientId,
                'Donación de materiales'
            ]
        );

        // Asociar bienes con desplazamientos
        await db.query(
            'INSERT INTO DesplazamientoBien (id_desplazamiento, id_bien) VALUES (?, ?), (?, ?), (?, ?)',
            [
                desplazamiento1.insertId, bien1Id,
                desplazamiento1.insertId, bien2Id,
                desplazamiento2.insertId, bien3Id
            ]
        );

        // Crear registros de historial
        await db.query(
            'INSERT INTO HistorialMovimientos (id_persona, id_desplazamiento, accion, descripcion, usuario_registro) VALUES (?, ?, ?, ?, ?)',
            [
                demoId,
                desplazamiento1.insertId,
                'Creados',
                'Desplazamiento creado',
                'demo'
            ]
        );

        await db.query(
            'INSERT INTO HistorialMovimientos (id_persona, id_desplazamiento, accion, descripcion, usuario_registro) VALUES (?, ?, ?, ?, ?)',
            [
                recipientId,
                desplazamiento1.insertId,
                'Actualizados',
                'Desplazamiento completado',
                'demo'
            ]
        );

        console.log('✓ Usuario demo creado: usuario=demo, contraseña=demo');
        console.log('✓ Datos de prueba creados: Desplazamientos y Historial');
    } catch (err) {
        console.error('Error en seed:', err.message);
    }
};

module.exports = seedDatabase;
