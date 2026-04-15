CREATE TABLE IF NOT EXISTS TipoDocumento (
    id_tipo_documento INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Personas (
    id_persona INT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    direccion VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_tipo_documento INT,

    CONSTRAINT fk_id_tipo_documento
        FOREIGN KEY (id_tipo_documento) REFERENCES TipoDocumento(id_tipo_documento)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS TipoBien (
    id_tipo_bien INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS MotivoDesplazamiento (
    id_motivo INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS EstadoDesplazamiento (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Bien (
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

CREATE TABLE IF NOT EXISTS Desplazamiento (
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

CREATE TABLE IF NOT EXISTS HistorialMovimientos (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_persona INT,
    id_desplazamiento INT,
    accion VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario_registro VARCHAR(100),

    CONSTRAINT fk_historial_persona
        FOREIGN KEY (id_persona) REFERENCES personas(id_persona)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_historial_desplazamiento
        FOREIGN KEY (id_desplazamiento) REFERENCES Desplazamiento(id_desplazamiento)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- ALTER TABLE HistorialMovimientos
-- ADD INDEX IF NOT EXISTS idx_historial_persona (id_persona);

-- ALTER TABLE HistorialMovimientos
-- ADD INDEX IF NOT EXISTS idx_historial_desplazamiento (id_desplazamiento);

-- ALTER TABLE Desplazamiento
-- ADD INDEX IF NOT EXISTS idx_desplazamiento_motivo (id_motivo);

-- ALTER TABLE Desplazamiento
-- ADD INDEX IF NOT EXISTS idx_desplazamiento_estado (id_estado);