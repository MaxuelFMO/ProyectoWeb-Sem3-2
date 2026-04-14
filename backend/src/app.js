require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const dbPromise = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crud_template'
});

dbPromise.then(conn => {
    console.log('MySQL Database Connected');
    app.set('db', conn);
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Database connection failed:', err.message);
    process.exit(1); // Exit if DB connection fails
});

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const productRoutes = require('./routes/desplazamientoRoutes');

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/desplazamientos', desplazamientoRoutes);

app.get('/', (req, res) => {
    res.send('API CRUD Monorepo Running');
});
