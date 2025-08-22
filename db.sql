CREATE DATABASE IF NOT EXISTS myapp_db;
USE myapp_db;
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    papellido VARCHAR(50) NOT NULL,
    sapellido VARCHAR(50),
    barrio ENUM(
        'Bajo Cañada', 'Bengala', 'Bilbao', 'Camelias', 'Cañada Sur', 'Carmen', 'Cascajal', 'Cerro Azul', 
        'Colombari', 'Colonia Kennedy', 'Domingo Savio', 'Guacayama', 'Hogar Propio', 'Jazmín', 'López Mateo', 
        'Luna Park', 'Magnolias', 'Mojados', 'Monguito', 'Monte Azul', 'Musmani', 'Paso Ancho', 'Presidentes', 
        'San Martín', 'San Sebastián', 'Santa Rosa', 'Seminario', 'Zorobarú'
    ) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    password VARCHAR(255) NOT NULL
);

CREATE TABLE institucion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    sitio_web VARCHAR(150)
);

CREATE TABLE denuncia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo_denuncia ENUM(
        'Falta de acceso a educación de calidad',
        'Acceso limitado a servicios de salud',
        'Discriminación o exclusión de grupos vulnerables',
        'Viviendas en condiciones precarias o falta de vivienda digna',
        'Servicios básicos deficientes en zonas pobres',
        'Falta de seguridad en barrios marginados',
        'Niñez expuesta a riesgos sociales',
        'Desempleo y falta de oportunidades laborales'
    ) NOT NULL,
    descripcion TEXT NOT NULL,
    barrio ENUM(
        'Bajo Cañada', 'Bengala', 'Bilbao', 'Camelias', 'Cañada Sur', 'Carmen', 'Cascajal', 'Cerro Azul', 
        'Colombari', 'Colonia Kennedy', 'Domingo Savio', 'Guacayama', 'Hogar Propio', 'Jazmín', 'López Mateo', 
        'Luna Park', 'Magnolias', 'Mojados', 'Monguito', 'Monte Azul', 'Musmani', 'Paso Ancho', 'Presidentes', 
        'San Martín', 'San Sebastián', 'Santa Rosa', 'Seminario', 'Zorobarú'
    ) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);