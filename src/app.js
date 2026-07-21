const express = require("express");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");  
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();
const { requiereSesion } = require('./middlewares/auth');


const { pool } = require("./config/db");

// Ruta base para despliegue en subcarpeta (ej: /SOPORTEIT)
const BASE_PATH = process.env.BASE_PATH || '';

const app = express();

// ======= Configuración de sesión (debe ir antes de las rutas) =======
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_local",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1h
    },
  })
);
// ===== Sesión disponible en vistas =====
app.use((req, res, next) => {
  res.locals.session = req.session || {};
  res.locals.usuario = req.session?.usuario || null;
  res.locals.isAdmin =
    req.session?.usuario?.rol?.toUpperCase?.() === 'ADMIN';
  res.locals.basePath = BASE_PATH;
  next();
});


// ======= Configuración de vistas y estáticos =======
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'src', 'uploads')));
app.use(express.static(path.join(__dirname, "public")));

// ======= Middlewares =======
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressLayouts);
app.set("layout", "layouts/layout");

// ======= Rutas =======
const authRouter = require("./routes/auth");
app.use("/", authRouter);
const menuRouter = require("./routes/menu");
app.use("/", menuRouter);
const ticketsRouter = require('./routes/tickets');
app.use('/tickets', requiereSesion, ticketsRouter);



// Healthcheck app
app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

// Healthcheck DB
app.get("/dbcheck", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS now");
    res.json({ ok: true, now: rows[0].now });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ======= 404 & error handler =======
app.use((req, res) => {
  if (req.accepts("html")) return res.status(404).render("layouts/404");
  return res.status(404).json({ error: "Not found" });
});


// ======= Probar conexión al arrancar =======
(async () => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    console.log("✅ Conexión MySQL OK:", rows[0]);
  } catch (e) {
    console.error("❌ Error conectando a MySQL:", e.message);
  }
})();

// ======= Start server =======
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`no puedo mas`);
});
