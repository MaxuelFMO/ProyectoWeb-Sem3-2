require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const seedDatabase = require('./db/seed');

const app = express();

app.use(cors());
app.use(express.json());

// --- Routes (register before listen so they're ready) ---
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const desplazamientoRoutes = require('./routes/desplazamientoRoutes');
const bienRoutes = require('./routes/bienRoutes');
const historialMovimientosRoutes = require('./routes/historialMovimientosRoutes');
const authRoutes = require('./routes/authRoutes');
const catalogRoutes = require('./routes/catalogRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/personas', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/desplazamientos', desplazamientoRoutes);
app.use('/api/bienes', bienRoutes);
app.use('/api', catalogRoutes);
app.use('/api/historial', historialMovimientosRoutes);

app.get('/', (req, res) => {
    res.send('API CRUD Monorepo Running');
});

// --- Database setup ---
const DB_NAME = process.env.DB_NAME || 'crud_template';

let db;

async function createDatabase() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
    });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    await conn.end();
    console.log(`Database '${DB_NAME}' ensured`);
}

function createPool() {
    return mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: DB_NAME,
        multipleStatements: true,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        decimalNumbers: true,
    });
}

async function runMigrations(pool) {
    const sqlFilePath = path.join(__dirname, "./db/init.sql");
    const sqlQueries = fs.readFileSync(sqlFilePath, 'utf8');

    try {
        await pool.query(sqlQueries);
        console.log('Tables created successfully!');
    } catch (err) {
        console.error('Error executing SQL file:', err.message);
    }
}

(async () => {
    try {
        await createDatabase();   // 1. crea DB

        db = createPool();        // 2. conecta con DB

        await runMigrations(db);  // 3. crea tablas

        await seedDatabase(db);   // 4. crea usuario demo

        const conn = await db.getConnection();
        console.log('MySQL Connected');
        conn.release();

        app.set('db', db);

        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error('Startup error:', err.message);
        process.exit(1);
    }
})();