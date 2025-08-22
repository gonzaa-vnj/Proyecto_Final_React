const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { Document, Packer, Paragraph } = require('docx');
const fs = require('fs');
const path = require('path');

const db = require('./db'); 

const app = express();
const puerto = 3000;

app.use(cors());
app.use(bodyParser.json());

// --- RUTAS USUARIO ---

// Obtener todos los usuarios
app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM usuario', (err, resultados) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
    res.json(resultados);
  });
});

// Obtener usuario por id
app.get('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM usuario WHERE id = ?', [id], (err, resultados) => {
    if (err) return res.status(500).json({ error: 'Error al buscar usuario' });
    if (resultados.length === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(resultados[0]);
  });
});

// Crear usuario
app.post('/usuarios', (req, res) => {
  const { cedula, nombre, papellido, sapellido, barrio, email, telefono, password } = req.body;
  const consulta = `INSERT INTO usuario (cedula, nombre, papellido, sapellido, barrio, email, telefono, password)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(consulta, [cedula, nombre, papellido, sapellido, barrio, email, telefono, password], (err, resultado) => {
    if (err) {
      console.error('Error al crear usuario:', err);
      return res.status(500).json({ error: 'Error al crear usuario' });
    }
    res.status(201).json({ mensaje: 'Usuario creado', id: resultado.insertId });
  });
});

// Actualizar usuario
app.put('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const { cedula, nombre, papellido, sapellido, barrio, email, telefono, password } = req.body;
  const consulta = `UPDATE usuario SET cedula = ?, nombre = ?, papellido = ?, sapellido = ?, barrio = ?, email = ?, telefono = ?, password = ? WHERE id = ?`;
  db.query(consulta, [cedula, nombre, papellido, sapellido, barrio, email, telefono, password, id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar usuario' });
    res.json({ mensaje: 'Usuario actualizado' });
  });
});

// Eliminar usuario
app.delete('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM usuario WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar usuario' });
    res.json({ mensaje: 'Usuario eliminado' });
  });
});

// --- RUTAS INSTITUCION ---

// Obtener todas las instituciones
app.get('/instituciones', (req, res) => {
  db.query('SELECT * FROM institucion', (err, resultados) => {
    if (err) return res.status(500).json({ error: 'Error al obtener instituciones' });
    res.json(resultados);
  });
});

// Obtener institucion por id
app.get('/instituciones/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM institucion WHERE id = ?', [id], (err, resultados) => {
    if (err) return res.status(500).json({ error: 'Error al buscar institucion' });
    if (resultados.length === 0) return res.status(404).json({ mensaje: 'Institución no encontrada' });
    res.json(resultados[0]);
  });
});

// Crear institucion
app.post('/instituciones', (req, res) => {
  const { nombre, email, telefono, sitio_web } = req.body;
  const consulta = `INSERT INTO institucion (nombre, email, telefono, sitio_web) VALUES (?, ?, ?, ?)`;
  db.query(consulta, [nombre, email, telefono, sitio_web], (err, resultado) => {
    if (err) return res.status(500).json({ error: 'Error al crear institución' });
    res.status(201).json({ mensaje: 'Institución creada', id: resultado.insertId });
  });
});

// Actualizar institucion
app.put('/instituciones/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, email, telefono, sitio_web } = req.body;
  const consulta = `UPDATE institucion SET nombre = ?, email = ?, telefono = ?, sitio_web = ? WHERE id = ?`;
  db.query(consulta, [nombre, email, telefono, sitio_web, id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar institución' });
    res.json({ mensaje: 'Institución actualizada' });
  });
});

// Eliminar institucion
app.delete('/instituciones/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM institucion WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar institución' });
    res.json({ mensaje: 'Institución eliminada' });
  });
});

// --- FUNCIONES PARA CREAR Y ENVIAR DOCUMENTO DE DENUNCIA ---

async function crearDocDenuncia(denunciaData) {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: "Denuncia Ciudadana", heading: "Heading1" }),
        new Paragraph(`Nombre: ${denunciaData.nombre} ${denunciaData.papellido} ${denunciaData.sapellido || ''}`),
        new Paragraph(`Correo del usuario: ${denunciaData.email}`),
        new Paragraph(`Tipo de Denuncia: ${denunciaData.tipo_denuncia}`),
        new Paragraph(`Barrio: ${denunciaData.barrio}`),
        new Paragraph("Descripción:"),
        new Paragraph(denunciaData.descripcion),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const filePath = path.join(__dirname, 'temp', `denuncia_${Date.now()}.docx`);
  
  // Asegúrate que la carpeta temp exista, si no la creas:
  if (!fs.existsSync(path.join(__dirname, 'temp'))) {
    fs.mkdirSync(path.join(__dirname, 'temp'));
  }

  fs.writeFileSync(filePath, buffer);
  return filePath;
}

async function enviarCorreoConDenuncia(denunciaData) {
  const filePath = await crearDocDenuncia(denunciaData);

  // Configura tu transporter SMTP aquí:
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Cambia esto
    port: 587,
    secure: false,
    auth: {
      user: "gonzalo.vindasj@gmail.com", // Cambia esto
      pass: "iduj sdhh jedu vvry"            // Cambia esto
    },
  });

  let info = await transporter.sendMail({
    from: '"App Denuncias" <gonzalo.vindasj@gmail.com>', // Cambia este email por el que enviarás
    to: "gonzalo.vindasj@gmail.com",
    replyTo: denunciaData.email, // correo del usuario que hizo la denuncia
    subject: "Nueva denuncia ciudadana recibida",
    text: "Adjuntamos denuncia en documento .docx",
    attachments: [
      {
        filename: "denuncia.docx",
        path: filePath,
      },
    ],
  });

  // Borra el archivo temporal después de enviar
  fs.unlinkSync(filePath);
  return info;
}

// --- RUTAS DENUNCIA ---

// Obtener todas las denuncias
app.get('/denuncias', (req, res) => {
  db.query(`
    SELECT d.id, u.nombre, u.papellido, u.sapellido, d.tipo_denuncia, d.descripcion, d.barrio, d.fecha 
    FROM denuncia d JOIN usuario u ON d.usuario_id = u.id
  `, (err, resultados) => {
    if (err) return res.status(500).json({ error: 'Error al obtener denuncias' });
    res.json(resultados);
  });
});

// Obtener denuncia por id
app.get('/denuncias/:id', (req, res) => {
  const { id } = req.params;
  db.query(`
    SELECT d.id, u.nombre, u.papellido, u.sapellido, d.tipo_denuncia, d.descripcion, d.barrio, d.fecha 
    FROM denuncia d JOIN usuario u ON d.usuario_id = u.id
    WHERE d.id = ?
  `, [id], (err, resultados) => {
    if (err) return res.status(500).json({ error: 'Error al buscar denuncia' });
    if (resultados.length === 0) return res.status(404).json({ mensaje: 'Denuncia no encontrada' });
    res.json(resultados[0]);
  });
});

// Crear denuncia y enviar correo
app.post('/denuncias', async (req, res) => {
  const { usuario_id, tipo_denuncia, descripcion, barrio } = req.body;

  // Primero buscamos el correo y nombre del usuario para adjuntar en el doc y replyTo
  db.query('SELECT nombre, papellido, sapellido, email FROM usuario WHERE id = ?', [usuario_id], async (err, resultados) => {
    if (err) return res.status(500).json({ error: 'Error al buscar usuario' });
    if (resultados.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    const usuario = resultados[0];

    // Insertar denuncia en BD
    const insertQuery = `INSERT INTO denuncia (usuario_id, tipo_denuncia, descripcion, barrio) VALUES (?, ?, ?, ?)`;
    db.query(insertQuery, [usuario_id, tipo_denuncia, descripcion, barrio], async (err2, resultadoInsert) => {
      if (err2) return res.status(500).json({ error: 'Error al crear denuncia' });

      // Datos para crear doc y enviar correo
      const denunciaData = {
        nombre: usuario.nombre,
        papellido: usuario.papellido,
        sapellido: usuario.sapellido,
        email: usuario.email,
        tipo_denuncia,
        descripcion,
        barrio,
      };

      try {
        await enviarCorreoConDenuncia(denunciaData);
        res.status(201).json({ mensaje: 'Denuncia creada y correo enviado', id: resultadoInsert.insertId });
      } catch (error) {
        console.error('Error al enviar correo:', error);
        res.status(500).json({ error: 'Denuncia creada pero error al enviar correo' });
      }
    });
  });
});

// Actualizar denuncia
app.put('/denuncias/:id', (req, res) => {
  const { id } = req.params;
  const { tipo_denuncia, descripcion, barrio } = req.body;
  const consulta = `UPDATE denuncia SET tipo_denuncia = ?, descripcion = ?, barrio = ? WHERE id = ?`;
  db.query(consulta, [tipo_denuncia, descripcion, barrio, id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar denuncia' });
    res.json({ mensaje: 'Denuncia actualizada' });
  });
});

// Eliminar denuncia
app.delete('/denuncias/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM denuncia WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar denuncia' });
    res.json({ mensaje: 'Denuncia eliminada' });
  });
});


// --- INICIO SERVIDOR ---
app.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});