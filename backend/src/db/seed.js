const bcrypt = require('bcryptjs');

const seedDatabase = async (db) => {
    try {
        // Verificar si el usuario demo ya existe
        const [existing] = await db.query(
            'SELECT id_persona FROM users WHERE nombres = ?',
            ['demo']
        );

        if (existing.length > 0) {
            console.log('✓ Usuario demo ya existe');
            return;
        }

        // Hash para contraseña "demo"
        const hashedPassword = await bcrypt.hash('demo', 10);

        // Insertar usuario demo
        await db.query(
            'INSERT INTO users (nombres, apellidos, password_hash, estado) VALUES (?, ?, ?, TRUE)',
            ['demo', 'Usuario de Demostración', hashedPassword]
        );

        console.log('✓ Usuario demo creado: usuario=demo, contraseña=demo');
    } catch (err) {
        console.error('Error en seed:', err.message);
    }
};

module.exports = seedDatabase;
