-- Database initialization script
CREATE DATABASE IF NOT EXISTS crud_template;
USE crud_template;

-- =====================================
-- TABLA: Persona
-- =====================================
CREATE TABLE users (
    id_persona INT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    direccion VARCHAR(255),
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_tipo_documento INT
);

-- =====================================
-- TABLA: MotivoDesplazamiento
-- =====================================
CREATE TABLE MotivoDesplazamiento (
    id_motivo INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(150) NOT NULL
);

-- =====================================
-- TABLA: EstadoDesplazamiento
-- =====================================
CREATE TABLE EstadoDesplazamiento (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
);

-- =====================================
-- TABLA: TipoBien
-- =====================================
CREATE TABLE TipoBien (
    id_tipo_bien INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- =====================================
-- TABLA: Bien
-- =====================================
CREATE TABLE Bien (
    id_bien INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255),
    valor DECIMAL(10,2),
    id_tipo_bien INT,
    estado BOOLEAN DEFAULT TRUE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_bien_tipo
        FOREIGN KEY (id_tipo_bien) REFERENCES TipoBien(id_tipo_bien)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- =====================================
-- TABLA: Desplazamiento
-- =====================================
CREATE TABLE Desplazamiento (
    id_desplazamiento INT AUTO_INCREMENT PRIMARY KEY,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME,
    id_motivo INT,
    id_estado INT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_desplazamiento_motivo
        FOREIGN KEY (id_motivo) REFERENCES MotivoDesplazamiento(id_motivo)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_desplazamiento_estado
        FOREIGN KEY (id_estado) REFERENCES EstadoDesplazamiento(id_estado)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- =====================================
-- TABLA: HistorialMovimientos
-- =====================================
CREATE TABLE HistorialMovimientos (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_persona INT,
    id_desplazamiento INT,
    accion VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario_registro VARCHAR(100),

    CONSTRAINT fk_historial_persona
        FOREIGN KEY (id_persona) REFERENCES users(id_persona)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_historial_desplazamiento
        FOREIGN KEY (id_desplazamiento) REFERENCES Desplazamiento(id_desplazamiento)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- =====================================
-- ÍNDICES (opcional pero recomendado)
-- =====================================
CREATE INDEX idx_historial_persona ON HistorialMovimientos(id_persona);
CREATE INDEX idx_historial_desplazamiento ON HistorialMovimientos(id_desplazamiento);
CREATE INDEX idx_desplazamiento_motivo ON Desplazamiento(id_motivo);
CREATE INDEX idx_desplazamiento_estado ON Desplazamiento(id_estado);