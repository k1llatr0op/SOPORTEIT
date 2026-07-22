const { Router } = require("express");
const router = Router();
const { pool } = require("../config/db");
const { requiereSesion } = require('../middlewares/auth');

// GET /menu  — pestañas, búsqueda, área y orden
router.get("/menu", requiereSesion, async (req, res) => {
  const tab  = (req.query.tab  || "abiertos").toLowerCase(); // "abiertos" | "cerrados"
  const q    = (req.query.q    || "").trim();
  const area = (req.query.area || "").trim();
  const sort = (req.query.sort || "desc").toLowerCase();     // "desc" | "asc"

  const where = [];
  const params = [];

  // Pestañas por estado
  if (tab === "abiertos") {
    where.push("t.estado NOT IN ('Cerrado','Cerrada')");
  } else {
    where.push("t.estado IN ('Cerrado','Cerrada')");
  }

 // Filtro por área
if (area) {

  switch (area.toUpperCase()) {

    case "SISTEMAS":
      where.push("(UPPER(TRIM(t.area))='SISTEMAS' OR UPPER(TRIM(t.area))='TECNOLOGÍA')");
      break;

    case "A Y B":
      where.push("UPPER(TRIM(t.area))='A Y B'");
      break;

    case "AMA DE LLAVES":
      where.push("UPPER(TRIM(t.area))='AMA DE LLAVES'");
      break;

    default:
      where.push("UPPER(TRIM(t.area)) = UPPER(TRIM(?))");
      params.push(area);
      break;
  }
}
  if (q) {
    where.push(`(
      CAST(t.id_ticket AS CHAR) LIKE ? OR
      t.ticket_sn LIKE ? OR
      t.numeroserie LIKE ? OR
      t.placa_af LIKE ? OR
      t.equipo LIKE ? OR
      t.marca LIKE ? OR
      t.modelo LIKE ? OR
      t.tipo LIKE ? OR
      t.estado LIKE ? OR
      t.resumen LIKE ? OR
      t.resp_interno LIKE ? OR
      t.usuario_resp LIKE ? OR
      t.contacto_resp LIKE ? OR
      t.area LIKE ? OR
      t.departamento LIKE ? OR
      DATE_FORMAT(t.fecha_ticket, '%d/%m/%Y') LIKE ? OR
      DATE_FORMAT(t.fecha_ticket, '%Y-%m-%d') LIKE ?
    )`);
    for (let i = 0; i < 17; i++) params.push(`%${q}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderSql = sort === "asc" ? "ASC" : "DESC";

if (!q) {
  const whereEstado = (tab === "abiertos")
    ? "t.estado NOT IN ('CERRADO','CERRADA')"
    : "t.estado IN ('CERRADO','CERRADA')";

 let areaFilter = "";

if (area) {

  switch (area.toUpperCase()) {

    case "SISTEMAS":
      areaFilter =
        " AND (UPPER(TRIM(t.area))='SISTEMAS' OR UPPER(TRIM(t.area))='TECNOLOGÍA')";
      break;

    case "A Y B":
      areaFilter =
        " AND UPPER(TRIM(t.area))='A Y B'";
      break;

    case "AMA DE LLAVES":
      areaFilter =
        " AND UPPER(TRIM(t.area))='AMA DE LLAVES'";
      break;

    default:
      areaFilter =
        ` AND UPPER(TRIM(t.area)) = UPPER(TRIM('${area.replace(/'/g, "''")}'))`;
      break;
  }

}

  const sqlFast = `
    SELECT
      t.id_ticket,
      t.ticket_sn,
      t.numeroserie,
      t.placa_af,
      t.equipo,
      t.marca,
      t.modelo,
      t.tipo,
      t.estado,
      t.area,
      t.departamento,
      t.usuario_resp,
      t.contacto_resp,
      t.resumen,
      t.resp_interno,
      DATE_FORMAT(t.fecha_ticket, '%d/%m/%Y') AS fecha_fmt
    FROM tickets t
    WHERE ${whereEstado}${areaFilter}
    ORDER BY t.fecha_ticket ${orderSql}, t.id_ticket ${orderSql}
    LIMIT 200
  `;

  const [rows] = await pool.query(sqlFast);
  return res.render("menu/index", {
    title: `Procesos ${tab === "abiertos" ? "Abiertos" : "Cerrados"}`,
    usuario: req.session.usuario,
    tickets: rows,
    tab, q, area, sort
  });
}
  const sql = `
    SELECT
      t.id_ticket,
      t.ticket_sn,
      t.numeroserie,
      t.placa_af,
      t.equipo,
      t.marca,
      t.modelo,
      t.tipo,
      t.estado,
      t.area,
      t.departamento,
      t.usuario_resp,
      t.contacto_resp,
      t.resumen,
      t.resp_interno,
      DATE_FORMAT(t.fecha_ticket, '%d/%m/%Y') AS fecha_fmt
    FROM tickets t
    ${whereSql}
    ORDER BY t.fecha_ticket ${orderSql}, t.id_ticket ${orderSql}
    LIMIT 200
  `;

  try {
    const [rows] = await pool.query(sql, params);
    res.render("menu/index", {
      title: `Procesos ${tab === "abiertos" ? "Abiertos" : "Cerrados"}`,
      usuario: req.session.usuario,
      tickets: rows,
      tab, q, area, sort
    });
  } catch (err) {
    console.error("Error listando tickets:", err);
    res.status(500).render("errors/500", {
      title: "Error",
      error: "No se pudieron cargar los tickets."
    });
  }
});

module.exports = router;
