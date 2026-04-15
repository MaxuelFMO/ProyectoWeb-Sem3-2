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

let db
async function createDatabase() {
    await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
    }).then(conn => {
        return conn.query('CREATE DATABASE IF NOT EXISTS crud_template')
            .then(() => conn.end());
    });

    console.log('Database ensured');
}

function createPool() {
    return mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: 'crud_template',
        multipleStatements: true,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
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

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error('Startup error:', err.message);
        process.exit(1);
    }
})();

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const desplazamientoRoutes = require('./routes/desplazamientoRoutes');
const bienRoutes = require('./routes/bienRoutes');
const historialMovimientosRoutes = require('./routes/historialMovimientosRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/personas', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/desplazamientos', desplazamientoRoutes);
app.use('/api/bienes', bienRoutes);
app.use('/api/historial', historialMovimientosRoutes);

app.get('/', (req, res) => {
    res.send('API CRUD Monorepo Running');
});