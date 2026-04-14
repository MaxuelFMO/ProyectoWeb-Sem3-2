require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

async function initDatabase(db) {
    try {
        const sqlFilePath = path.join(__dirname, "./db/init.sql");
        console.log(__dirname);
        const sqlQueries = fs.readFileSync(sqlFilePath, 'utf8');

        await db.query(sqlQueries);
        console.log('Database and tables created successfully!');
    } catch (err) {
        console.error('Error executing SQL file:', err.message);
    }
}

const dbPromise = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    // database: process.env.DB_NAME || 'crud_template',
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

(async () => {
    try {
        const conn = await dbPromise.getConnection();
        console.log('MySQL Database Connected');
        conn.release();

        app.set('db', dbPromise);

        await initDatabase(dbPromise);

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
})();

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const desplazamientoRoutes = require('./routes/desplazamientoRoutes');

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/desplazamientos', desplazamientoRoutes);

app.get('/', (req, res) => {
    res.send('API CRUD Monorepo Running');
});
