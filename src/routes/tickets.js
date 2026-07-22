const { Router } = require('express');
const router = Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { pool } = require('../config/db');
const { requiereSesion} = require('../middlewares/auth');
const { requiereAdmin } = require('../middlewares/authz');

// Storage para imágenes de evidencia del ticket
function ensureDirEvidencia(id) {
  const dir = path.join(__dirname, '..', 'uploads', 'tickets', String(id));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}
const storageEvidencia = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ensureDirEvidencia(req.params.id)),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const base = path.basename(file.originalname || 'file', ext).replace(/\s+/g, '_');
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage: storageEvidencia,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    const allow = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allow.includes(file.mimetype)) return cb(new Error('Tipo de archivo no permitido'), false);
    cb(null, true);
  }
});

/* =========================
 * Helpers
 * =======================*/
function mapTipoToEnum(tipoUI = '') {
  const t = String(tipoUI).toLowerCase();
  if (t.includes('diag')) return 'Diagnóstico';
  if (t.includes('manten')) return 'Mantenimiento';
  if (t.includes('config')) return 'Configuración';
  if (t.includes('gar')) return 'Garantía';
  return 'Diagnóstico';
}
function limpiar(v) {
  if (v === undefined || v === null) return "";
  if (typeof v === 'string') return v.trim();
  return String(v);
}
function hoyYYYYMMDD() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/* =========================
 * Multer (bitácora adjuntos)
 * =======================*/
function ensureDirTicket(id) {
  const dir = path.join(__dirname, '..', 'uploads', 'tickets', String(id));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}
const storageBitacora = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ensureDirTicket(req.params.id)),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const base = path.basename(file.originalname || 'file', ext).replace(/\s+/g, '_');
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});
const uploadNota = multer({
  storage: storageBitacora,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allow = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allow.includes(file.mimetype)) return cb(new Error('Tipo de archivo no permitido'), false);
    cb(null, true);
  }
});

/* =========================
 * Rutas
 * =======================*/

// ---------- GET /tickets/nuevo ----------
router.get('/nuevo', requiereSesion, requiereAdmin, (req, res) => {
  const t = req.query.tipo || 'Diagnóstico';
  if (/manten/i.test(t) || /diag/i.test(t)) {
    return res.render('tickets/form_diag_mant', { title: `Nuevo ${t}`, tipo: t });
  }
  if (/config/i.test(t)) {
    return res.render('tickets/form_config', { title: 'Nueva Configuración', tipo: 'Configuración' });
  }
  if (/gar/i.test(t)) {
    return res.render('tickets/form_garantia', { title: 'Nueva Garantía', tipo: 'Garantía' });
  }
  return res.render('tickets/form_diag_mant', { title: 'Nuevo Diagnóstico', tipo: 'Diagnóstico' });
});

// ---------- POST /tickets/guardar ----------
router.post('/guardar', requiereSesion, requiereAdmin, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const tipoEnum = mapTipoToEnum(req.body.tipo);
    const estadoEnum = limpiar(req.body.estado) || 'ABIERTO';
    const fecha = limpiar(req.body.fecha_ticket) || hoyYYYYMMDD();

    // Padre
    const sqlTickets = `
      INSERT INTO tickets
      (tipo, estado, area, departamento, fecha_ticket,
       equipo, marca, modelo, placa_af, numeroserie,
       usuario_resp, contacto_resp, resp_interno, resumen, ticket_sn,
       firma_ingeniero, firma_jefatura)
      VALUES (?,?,?,?,?,
              ?,?,?,?,?,
              ?,?,?,?, ?,
              ?,?)
    `;
    const valsTickets = [
      tipoEnum,
      estadoEnum,
      limpiar(req.body.area),
      limpiar(req.body.departamento),
      fecha,

      limpiar(req.body.equipo),
      limpiar(req.body.marca),
      limpiar(req.body.modelo),
      limpiar(req.body.placa_af),
      limpiar(req.body.numeroserie),

      limpiar(req.body.usuario_resp),
      limpiar(req.body.contacto_resp),
      limpiar(req.body.resp_interno || (req.session.usuario?.nombre ?? "Administrador")),
      limpiar(req.body.resumen),
      limpiar(req.body.ticket_sn),
      limpiar(req.body.firma_ingeniero),
      limpiar(req.body.firma_jefatura)
    ];
    const [r1] = await conn.query(sqlTickets, valsTickets);
    const id_ticket = r1.insertId;

    // Hijo
    if (tipoEnum === 'Diagnóstico' || tipoEnum === 'Mantenimiento') {
      const sqlDM = `
        INSERT INTO ticket_dm
        (usuario_windows, contra_windows, nombre_equipo, tiempo_uso,
         procesador, almacenamiento, ram, garantia, dictamen_tecnico,
         id_ticketcomun)
        VALUES (?,?,?,?, ?,?,?,?, ?,?)
      `;
      const valsDM = [
        limpiar(req.body.usuario_windows),
        limpiar(req.body.contra_windows),
        limpiar(req.body.nombre_equipo),
        limpiar(req.body.tiempo_total_uso),
        limpiar(req.body.procesador),
        limpiar(req.body.almacenamiento),
        limpiar(req.body.memoria_ram),
        limpiar(req.body.vigencia_garantia),
        limpiar(req.body.dictamen_tecnico),
        id_ticket
      ];
      await conn.query(sqlDM, valsDM);

    } else if (tipoEnum === 'Configuración') {
      const sqlConf = `
        INSERT INTO ticket_conf
        (entrego_cargador, usuario_windows, contra_windows, programas_solicitados, id_ticketcomun)
        VALUES (?,?,?,?,?)
      `;
      const valsConf = [
        limpiar(req.body.entrego_cargador),
        limpiar(req.body.usuario_windows),
        limpiar(req.body.contra_windows),
        limpiar(req.body.programas_solicitados || req.body.programas),
        id_ticket
      ];
      await conn.query(sqlConf, valsConf);

    } else if (tipoEnum === 'Garantía') {
      const toDateOrNull = (s) => {
        const v = limpiar(s);
        return v ? v : null;
      };
      const sqlGar = `
        INSERT INTO ticket_gar
        (empresa_proveedora, folio_ticket, contacto_proveedor, descripcion_falla,
         fecha_reporte_proveedor, fecha_envio, fecha_recepcion,
         resultado, observaciones, id_ticketcomun)
        VALUES (?,?,?,?, ?,?, ?,?, ?,?)
      `;
      const valsGar = [
        limpiar(req.body.empresa_proveedora),
        limpiar(req.body.folio_ticket),
        limpiar(req.body.contacto_proveedor),
        limpiar(req.body.descripcion_falla),
        toDateOrNull(req.body.fecha_reporte_proveedor),
        toDateOrNull(req.body.fecha_envio),
        toDateOrNull(req.body.fecha_recepcion),
        limpiar(req.body.resultado),
        limpiar(req.body.observaciones),
        id_ticket
      ];
      await conn.query(sqlGar, valsGar);
    }

    await conn.commit();
    return res.redirect(303, `/tickets/${id_ticket}?toast=creado`);
  } catch (err) {
    await conn.rollback();
    console.error('Error guardando ticket:', err);
    return res.status(500).render('errors/500', {
      title: 'Error',
      error: 'No se pudo guardar el ticket.'
    });
  } finally {
    conn.release();
  }
});

// ---------- GET /tickets/:id (Detalle del Ticket) ----------
router.get('/:id', requiereSesion, async (req, res) => {
  const id = Number(req.params.id);
  const conn = await pool.getConnection();

  try {
    // 1. Traer la información principal del ticket
    const [[ticket]] = await conn.query(
      `SELECT * FROM tickets WHERE id_ticket = ? LIMIT 1`, 
      [id]
    );

    if (!ticket) {
      return res.status(404).render('errors/404', { title: 'No encontrado' });
    }

    // 2. NUEVO Y CRÍTICO: Traer TODAS las imágenes de evidencia de este ticket
    // Usamos tus columnas reales: adjunto_path y adjunto_nombre
    const [evidenciasRows] = await conn.query(
      `SELECT adjunto_path AS path, adjunto_nombre AS nombre 
       FROM ticket_evidencias 
       WHERE id_ticket = ?`,
      [id]
    );

    // Mapeamos los resultados para que coincidan con lo que tu frontend (EJS) ya espera
    ticket.imagenes_evidencia = evidenciasRows;

    // 3. Traer datos extras según el tipo de ticket (Tu código existente)
    if (ticket.tipo === 'Diagnóstico' || ticket.tipo === 'Mantenimiento') {
      const [[dm]] = await conn.query(`SELECT * FROM ticket_dm WHERE id_ticketcomun = ?`, [id]);
      ticket.dm = dm || {};
    } else if (ticket.tipo === 'Garantía') {
      const [[gar]] = await conn.query(`SELECT * FROM ticket_gar WHERE id_ticketcomun = ?`, [id]);
      ticket.gar = gar || {};
    } else if (ticket.tipo === 'Configuración') {
      const [[conf]] = await conn.query(`SELECT * FROM ticket_conf WHERE id_ticketcomun = ?`, [id]);
      ticket.conf = conf || {};
    }

    // 4. Traer notas de la bitácora si existen
    const [bitacora] = await conn.query(
      `SELECT * FROM ticket_bitacora WHERE id_ticket = ? ORDER BY fecha_nota DESC`, 
      [id]
    );

    // Renderizamos enviando el objeto ticket que ya incluye su arreglo completo de imágenes
    return res.render('tickets/detalle', {
      title: `Ticket #${id}`,
      ticket,
      hijo: ticket.dm || ticket.gar || ticket.conf || {},
      notas: bitacora,
      bitacora
    });

  } catch (err) {
    console.error('Error cargando detalle del ticket:', err);
    return res.status(500).render('errors/500', { title: 'Error' });
  } finally {
    conn.release();
  }
});


// ---------- POST /tickets/:id/actualizar ----------
// Asegúrate de pasar el middleware de multer aquí: upload.array('imagenes_evidencia')
router.post('/:id/actualizar', requiereSesion, requiereAdmin, upload.array('imagenes_evidencia'), async (req, res) => {
  const id = Number(req.params.id);
  const conn = await pool.getConnection();
  const toDateOrNull = (v) => {
    const s = limpiar(v);
    return s ? s : null;
  };

  try {
    await conn.beginTransaction();

    const [[t]] = await conn.query(`SELECT tipo FROM tickets WHERE id_ticket=? LIMIT 1`, [id]);
    if (!t) {
      await conn.rollback();
      return res.status(404).render('errors/404', { title: 'No encontrado' });
    }

    // 1. Guardar la información principal del ticket
    await conn.query(
      `UPDATE tickets
       SET estado=?, area=?, departamento=?, fecha_ticket=?,
           equipo=?, marca=?, modelo=?, placa_af=?, numeroserie=?,
           usuario_resp=?, contacto_resp=?, resp_interno=?, resumen=?, ticket_sn=?,
           firma_ingeniero=?, firma_jefatura=?
       WHERE id_ticket=?`,
      [
        (limpiar(req.body.estado) || 'ABIERTO').toUpperCase(),
        limpiar(req.body.area),
        limpiar(req.body.departamento),
        limpiar(req.body.fecha_ticket),
        limpiar(req.body.equipo),
        limpiar(req.body.marca),
        limpiar(req.body.modelo),
        limpiar(req.body.placa_af),
        limpiar(req.body.numeroserie),
        limpiar(req.body.usuario_resp),
        limpiar(req.body.contacto_resp),
        limpiar(req.body.resp_interno),
        limpiar(req.body.resumen),
        limpiar(req.body.ticket_sn),
        limpiar(req.body.firma_ingeniero),
        limpiar(req.body.firma_jefatura),
        id
      ]
    );

    // ==========================================
    // NUEVO: PROCESAR IMÁGENES DE EVIDENCIA (SINTAXIS SQL CORREGIDA)
    // ==========================================
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Armamos la ruta web relativa limpia: uploads/tickets/9/archivo.jpg
        // Usamos file.filename porque multer ya guardó físicamente el archivo hasheado
        const rutaParaBaseDatos = `uploads/tickets/${id}/${file.filename}`.replace(/\\/g, "/");
        const nombreOriginal = file.originalname;

        // Se eliminó la sintaxis incorrecta ("id_evidencia,") para que MariaDB no falle.
        // Se usan los campos correctos de tu archivo .sql (id_ticket, path, nombre)
        await conn.query(
          `INSERT INTO ticket_evidencias (id_ticket, adjunto_path, adjunto_nombre) 
           VALUES (?, ?, ?)`,
          [
            id,
            rutaParaBaseDatos,
            nombreOriginal
          ]
        );
      }
    }
    // ==========================================

    // 2. Guardar información de los datos específicos del tipo de ticket
    if (t.tipo === 'Diagnóstico' || t.tipo === 'Mantenimiento') {
      await conn.query(
        `UPDATE ticket_dm
         SET usuario_windows=?, contra_windows=?, nombre_equipo=?, tiempo_uso=?,
             procesador=?, almacenamiento=?, ram=?, garantia=?, dictamen_tecnico=?
         WHERE id_ticketcomun=?`,
        [
          limpiar(req.body.usuario_windows),
          limpiar(req.body.contra_windows),
          limpiar(req.body.nombre_equipo),
          limpiar(req.body.tiempo_total_uso),
          limpiar(req.body.procesador),
          limpiar(req.body.almacenamiento),
          limpiar(req.body.memoria_ram),
          limpiar(req.body.vigencia_garantia),
          limpiar(req.body.dictamen_tecnico),
          id
        ]
      );
    } else if (t.tipo === 'Garantía') {
      await conn.query(
        `UPDATE ticket_gar
         SET empresa_proveedora=?, folio_ticket=?, contacto_proveedor=?, descripcion_falla=?,
             fecha_reporte_proveedor=?, fecha_envio=?, fecha_recepcion=?,
             resultado=?, observaciones=?
         WHERE id_ticketcomun=?`,
        [
          limpiar(req.body.empresa_proveedora),
          limpiar(req.body.folio_ticket),
          limpiar(req.body.contacto_proveedor),
          limpiar(req.body.descripcion_falla),
          toDateOrNull(req.body.fecha_reporte_proveedor),
          toDateOrNull(req.body.fecha_envio),
          toDateOrNull(req.body.fecha_recepcion),
          limpiar(req.body.resultado),
          limpiar(req.body.observaciones),
          id
        ]
      );
    } else if (t.tipo === 'Configuración') {
      await conn.query(
        `UPDATE ticket_conf
         SET entrego_cargador=?, usuario_windows=?, contra_windows=?, programas_solicitados=?
         WHERE id_ticketcomun=?`,
        [
          limpiar(req.body.entrego_cargador),
          limpiar(req.body.usuario_windows),
          limpiar(req.body.contra_windows),
          limpiar(req.body.programas_solicitados || req.body.programas),
          id
        ]
      );
    }

    await conn.commit();
    return res.redirect(`/tickets/${id}?toast=guardado`);
  } catch (err) {
    await conn.rollback();
    console.error('Error actualizando ticket:', err);
    return res.status(500).render('errors/500', { title: 'Error', error: 'No se pudo actualizar el ticket.' });
  } finally {
    conn.release();
  }
});

// ---------- POST /tickets/:id/estado ----------
router.post('/:id/estado', requiereSesion, requiereAdmin, async (req, res) => {
  const { id } = req.params;
  const nuevoEstado = (req.body.estado || '').trim().toUpperCase();

  try {
    await pool.query('UPDATE tickets SET estado=? WHERE id_ticket=?', [nuevoEstado, id]);
    return res.redirect(`/tickets/${id}?toast=estado`);
  } catch (err) {
    console.error('Error actualizando estado:', err);
    return res.status(500).render('errors/500', { title: 'Error', error: 'No se pudo actualizar el estado.' });
  }
});

// ---------- POST /tickets/:id/eliminar ----------
router.post('/:id/eliminar', requiereSesion, requiereAdmin, async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM tickets WHERE id_ticket = ?', [id]); // hijos caen por CASCADE
    await conn.commit();
    return res.redirect('/menu?toast=eliminado');
  } catch (err) {
    await conn.rollback();
    console.error('Error eliminando ticket:', err);
    return res.status(500).render('errors/500', {
      title: 'Error',
      error: 'No se pudo eliminar el ticket.'
    });
  } finally {
    conn.release();
  }
});

router.post('/:id/bitacora', requiereSesion, requiereAdmin, uploadNota.single('adjunto'), async (req, res) => {
  const id = Number(req.params.id) || 0;
  if (!id) return res.redirect('/menu?toast=error');

  // Requerido: nombre escrito manualmente
  const responsable = (req.body.responsable || '').trim();
  if (!responsable) return res.redirect(`/tickets/${id}?toast=nota_vacia`);

  const texto = (req.body.texto || '').trim();
  if (!texto) return res.redirect(`/tickets/${id}?toast=nota_vacia`);

  const idUsuario = req.session.usuario?.id_usuario ?? null; // opcional (para la FK)

  let adjNom = null, adjPath = null;
  if (req.file) {
    const fname = req.file.filename;                         // p.ej. "Yo.png"
    adjNom = req.file.originalname || fname;               // nombre para mostrar
    adjPath = `uploads/tickets/${id}/${fname}`;             // <- NO uses req.file.path
  }
  try {
    await pool.query(
      `INSERT INTO ticket_bitacora
         (id_ticket, id_usuario, responsable, texto, adjunto_nombre, adjunto_path, fecha_nota)
       VALUES (?,?,?,?,?,?, NOW())`,
      [id, idUsuario, responsable, texto, adjNom, adjPath]
    );
    return res.redirect(`/tickets/${id}?toast=nota_creada`);
  } catch (e) {
    console.error('Error creando nota:', e);
    return res.redirect(`/tickets/${id}?toast=error`);
  }
});

const deleteAdjunto = async (req, res) => {
  console.log('[BITACORA] deleteAdjunto', req.method, req.originalUrl, req.params, req.query, req.body);
  const id = Number(req.params.id) || 0;
  const notaId = Number(req.body.notaId) || Number(req.query.notaId) || Number(req.params.notaId) || 0;
  if (!id || !notaId) return res.redirect('/menu?toast=error');

  const method = req.method.toUpperCase();
  if (method !== 'POST' && method !== 'GET') {
    return res.redirect(`/tickets/${id}?toast=error`);
  }

  try {
    const [rows] = await pool.query(
      'SELECT adjunto_path FROM ticket_bitacora WHERE id_nota = ? AND id_ticket = ?',
      [notaId, id]
    );
    if (!rows.length || !rows[0].adjunto_path) {
      return res.redirect(`/tickets/${id}?toast=error`);
    }

    const filePath = path.join(__dirname, '..', rows[0].adjunto_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query(
      'UPDATE ticket_bitacora SET adjunto_nombre = NULL, adjunto_path = NULL WHERE id_nota = ?',
      [notaId]
    );

    return res.redirect(`/tickets/${id}?toast=guardado`);
  } catch (err) {
    console.error('Error eliminando adjunto:', err);
    return res.redirect(`/tickets/${id}?toast=error`);
  }
};

const deleteNota = async (req, res) => {
  console.log('[BITACORA] deleteNota', req.method, req.originalUrl, req.params, req.query, req.body);
  const id = Number(req.params.id) || 0;
  const notaId = Number(req.params.notaId) || Number(req.body.notaId) || 0;
  if (!id || !notaId) return res.redirect('/menu?toast=error');

  try {
    const [rows] = await pool.query(
      'SELECT adjunto_path FROM ticket_bitacora WHERE id_nota = ? AND id_ticket = ?',
      [notaId, id]
    );

    if (rows.length && rows[0].adjunto_path) {
      const filePath = path.join(__dirname, '..', rows[0].adjunto_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await pool.query('DELETE FROM ticket_bitacora WHERE id_nota = ? AND id_ticket = ?', [notaId, id]);
    return res.redirect(`/tickets/${id}?toast=guardado`);
  } catch (err) {
    console.error('Error eliminando nota:', err);
    return res.redirect(`/tickets/${id}?toast=error`);
  }
};

router.all('/:id/bitacora/eliminar-adjunto', requiereSesion, requiereAdmin, deleteAdjunto);
router.all('/:id/bitacora/:notaId/eliminar-adjunto', requiereSesion, requiereAdmin, deleteAdjunto);
router.get('/:id/bitacora/:notaId/eliminar', requiereSesion, requiereAdmin, deleteNota);
router.post('/:id/bitacora/:notaId/eliminar', requiereSesion, requiereAdmin, deleteNota);

// Ruta de respaldo para capturar URLs inesperadas y redirigir correctamente
router.all('/:id/bitacora/:notaId/:action', requiereSesion, requiereAdmin, async (req, res, next) => {
  const { action } = req.params;
  if (action === 'eliminar') return deleteNota(req, res);
  if (action === 'eliminar-adjunto') return deleteAdjunto(req, res);
  return next();
});

module.exports = router;