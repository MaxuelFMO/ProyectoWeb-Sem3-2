# Guía de Configuración del Backend Express

Este documento proporciona instrucciones para configurar el backend Express que funciona con el frontend del Sistema de Patrimonio.

## 📋 Requisitos

- Node.js 14+ y npm
- MySQL 5.7+ (o MariaDB)
- Express 4.x
- JWT (jsonwebtoken)

## 🚀 Instalación Inicial

### 1. Crear proyecto Express

```bash
mkdir sistema-patrimonio-backend
cd sistema-patrimonio-backend
npm init -y
```

### 2. Instalar dependencias

```bash
npm install express cors mysql2 dotenv jsonwebtoken bcryptjs body-parser
npm install -D nodemon
```

### 3. Crear estructura de carpetas

```
/backend
├── config/
│   └── database.js
├── routes/
│   ├── auth.js
│   ├── personas.js
│   ├── desplazamientos.js
│   ├── historial.js
│   └── catalogs.js
├── controllers/
│   ├── authController.js
│   ├── personasController.js
│   ├── desplazamientosController.js
│   ├── historialController.js
│   └── catalogsController.js
├── middleware/
│   └── auth.js
├── .env
├── .env.example
├── server.js
└── package.json
```

## 🔧 Configuración de Base de Datos

### Archivo: `config/database.js`

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'patrimonio_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
```

### Archivo: `.env`

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=patrimonio_db

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRATION=24h

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🔐 Middleware de Autenticación

### Archivo: `middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = { verifyToken };
```

## 🔑 Controlador de Autenticación

### Archivo: `controllers/authController.js`

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const connection = await pool.getConnection();
    
    // Buscar usuario por email (ajusta según tu schema)
    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];

    // Verificar contraseña (ajusta según tu implementación)
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      connection.release();
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id_persona: user.id_persona,
        email: user.email,
        nombres: user.nombres,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    connection.release();

    res.json({
      token,
      user: {
        id_persona: user.id_persona,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
```

## 👥 Controlador de Personas

### Archivo: `controllers/personasController.js`

```javascript
const pool = require('../config/database');

exports.getPersonas = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();

    let query = 'SELECT * FROM users WHERE 1=1';
    let params = [];

    if (search) {
      query += ' AND (nombres LIKE ? OR apellidos LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [personas] = await connection.query(query, params);

    // Contar total
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    let countParams = [];
    if (search) {
      countQuery += ' AND (nombres LIKE ? OR apellidos LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    const [countResult] = await connection.query(countQuery, countParams);

    connection.release();

    res.json({
      data: personas,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.createPersona = async (req, res) => {
  try {
    const { nombres, apellidos, fecha_nacimiento, direccion, password } = req.body;

    if (!nombres || !apellidos || !password) {
      return res.status(400).json({ error: 'Campos requeridos faltantes' });
    }

    const connection = await pool.getConnection();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.query(
      'INSERT INTO users (nombres, apellidos, fecha_nacimiento, direccion, password_hash, estado) VALUES (?, ?, ?, ?, ?, 1)',
      [nombres, apellidos, fecha_nacimiento || null, direccion || null, hashedPassword]
    );

    connection.release();

    res.status(201).json({ message: 'Persona creada exitosamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Implementar: GET /personas/:id, PUT /personas/:id, DELETE /personas/:id
```

## 📦 Controlador de Desplazamientos

### Archivo: `controllers/desplazamientosController.js`

```javascript
const pool = require('../config/database');

exports.getDesplazamientos = async (req, res) => {
  try {
    const { id_motivo, id_estado, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();

    let query = `
      SELECT d.*, m.descripcion as motivo, e.descripcion as estado
      FROM Desplazamiento d
      LEFT JOIN MotivoDesplazamiento m ON d.id_motivo = m.id_motivo
      LEFT JOIN EstadoDesplazamiento e ON d.id_estado = e.id_estado
      WHERE 1=1
    `;
    let params = [];

    if (id_motivo) {
      query += ' AND d.id_motivo = ?';
      params.push(id_motivo);
    }

    if (id_estado) {
      query += ' AND d.id_estado = ?';
      params.push(id_estado);
    }

    query += ' ORDER BY d.fecha_registro DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [desplazamientos] = await connection.query(query, params);

    // Contar total
    let countQuery = 'SELECT COUNT(*) as total FROM Desplazamiento WHERE 1=1';
    let countParams = [];
    if (id_motivo) {
      countQuery += ' AND id_motivo = ?';
      countParams.push(id_motivo);
    }
    if (id_estado) {
      countQuery += ' AND id_estado = ?';
      countParams.push(id_estado);
    }
    const [countResult] = await connection.query(countQuery, countParams);

    connection.release();

    res.json({
      data: desplazamientos,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Implementar: GET, POST, PUT, DELETE
```

## 🗂️ Controlador de Historial

### Archivo: `controllers/historialController.js`

```javascript
const pool = require('../config/database');

exports.getHistorial = async (req, res) => {
  try {
    const { id_persona, id_desplazamiento, page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();

    let query = `
      SELECT h.*, u.nombres, u.apellidos
      FROM HistorialMovimientos h
      LEFT JOIN users u ON h.id_persona = u.id_persona
      WHERE 1=1
    `;
    let params = [];

    if (id_persona) {
      query += ' AND h.id_persona = ?';
      params.push(id_persona);
    }

    if (id_desplazamiento) {
      query += ' AND h.id_desplazamiento = ?';
      params.push(id_desplazamiento);
    }

    query += ' ORDER BY h.fecha_hora DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [movimientos] = await connection.query(query, params);

    // Contar total
    let countQuery = 'SELECT COUNT(*) as total FROM HistorialMovimientos WHERE 1=1';
    let countParams = [];
    if (id_persona) {
      countQuery += ' AND id_persona = ?';
      countParams.push(id_persona);
    }
    const [countResult] = await connection.query(countQuery, countParams);

    connection.release();

    res.json({
      data: movimientos.map(m => ({
        ...m,
        nombre_persona: `${m.nombres} ${m.apellidos}`
      })),
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Implementar: POST
```

## 🛣️ Archivo Principal del Servidor

### Archivo: `server.js`

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/personas', require('./routes/personas'));
app.use('/api/desplazamientos', require('./routes/desplazamientos'));
app.use('/api/historial', require('./routes/historial'));
app.use('/api', require('./routes/catalogs'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error en el servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
```

## 📝 Script de Package.json

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

## 🚀 Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🧪 Testing de Endpoints

Usa Postman o curl para testear:

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com","password":"contraseña"}'

# Obtener personas
curl -X GET http://localhost:3001/api/personas \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📚 Notas Importantes

1. **Contraseñas**: Siempre hashea las contraseñas con `bcrypt`
2. **JWT Secret**: Cambia en producción a algo más seguro
3. **CORS**: Ajusta los orígenes permitidos según necesidad
4. **Validación**: Añade validación más robusta en producción
5. **Errores**: Implementa manejo de errores consistente
6. **Logging**: Considera usar Winston o similar para logs

## 🔗 Conexión con Frontend

El frontend en `http://localhost:3000` espera el backend en:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Asegúrate que ambos servicios estén corriendo para desarrollo local.
