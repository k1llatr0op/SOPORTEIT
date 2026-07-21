// src/routes/auth.js
const bcrypt = require('bcryptjs');
const { Router } = require("express");
const router = Router();
const { pool } = require("../config/db"); // asegura que exportas { pool } en config/db.js
const { requiereSesion } = require('../middlewares/auth');

// (Opcional) Evitar cache cuando hay sesión activa
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Vista de login
router.get(["/", "/login"], (req, res) => {
  const { error } = req.query;
  res.render("auth/login", {
    title: "Iniciar sesión",
    error: error || null,
    lastUser: "",
  });
});

// Validar credenciales
router.post("/login", async (req, res) => {
  // normaliza nombres (coinciden con tu form: name="usuario" y name="contra")
  const usuario = (req.body.usuario || "").trim();
  const contra = (req.body.contra || "").trim();

  try {
    // src/routes/auth.js  (solo cambia el SELECT)
    const [rows] = await pool.query(
      `SELECT id_usuario, usuario, nombre, rol, contra
      FROM usuarios
      WHERE BINARY usuario = ?
      LIMIT 1`,
      [usuario]
    );


    if (!rows.length) {
      return res.status(401).render("auth/login", {
        title: "Iniciar sesión",
        error: "Credenciales inválidas",
        lastUser: usuario
      });
    }

    const user = rows[0];
    const hashGuardado = user.contra || "";

    // La contraseña guardada puede estar como hash bcrypt ($2a$/$2b$/$2y$...)
    // o, si todavía no se migró ese usuario, en texto plano. Soportamos
    // ambos casos aquí para no dejar a nadie fuera de su cuenta, pero lo
    // ideal es que TODAS las contraseñas en la tabla `usuarios` terminen
    // siendo hashes bcrypt (ver nota al final de este archivo).
    const esHashBcrypt = /^\$2[aby]\$/.test(hashGuardado);
    const passwordValida = esHashBcrypt
      ? await bcrypt.compare(contra, hashGuardado)
      : contra !== "" && contra === hashGuardado;

    if (!passwordValida) {
      return res.status(401).render("auth/login", {
        title: "Iniciar sesión",
        error: "Credenciales inválidas",
        lastUser: usuario
      });
    }

    // No guardamos el hash de la contraseña en la sesión
    delete user.contra;

    //Regenera la sesión para prevenir fixation
    req.session.regenerate(err => {
      if (err) {
        console.error("Error al regenerar sesión:", err);
        return res.status(500).render("auth/login", {
          title: "Iniciar sesión",
          error: "Error interno del servidor",
          lastUser: usuario
        });
      }
      req.session.usuario = user;
      req.session.save(() => res.redirect("/menu"));
    });

  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).render("auth/login", {
      title: "Iniciar sesión",
      error: "Error interno del servidor",
      lastUser: usuario
    });
  }
});



// Forgot password
router.get("/forgot-password", (req, res) => {
  res.render("auth/forgot-password", {
    title: "Recuperar contraseña",
    error: null,
    message: null,
    contacto: "",
  });
});

router.post("/forgot-password", (req, res) => {
  const contacto = (req.body.contacto || "").trim();
  if (!contacto) {
    return res.status(400).render("auth/forgot-password", {
      title: "Recuperar contraseña",
      error: "Por favor ingresa tu correo o número de celular registrado.",
      message: null,
      contacto,
    });
  }

  return res.render("auth/forgot-password", {
    title: "Recuperar contraseña",
    error: null,
    message: "Si el correo o celular existe en el registro, te enviaremos un enlace para restablecer la contraseña.",
    contacto,
  });
});

// Cerrar sesión
router.get("/logout", (req, res) => {
  // destruye la sesión y limpia la cookie
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

/*
 * NOTA SOBRE MIGRACIÓN DE CONTRASEÑAS
 * ------------------------------------
 * El login de arriba acepta tanto hashes bcrypt como texto plano (como
 * respaldo), pero lo correcto es que la columna `usuarios.contra` SOLO
 * tenga hashes bcrypt. Si tienes usuarios con contraseña en texto plano,
 * puedes generarles un hash con este mini script (una sola vez):
 *
 *   node -e "console.log(require('bcryptjs').hashSync('LA_CONTRASEÑA', 10))"
 *
 * Y luego actualizas esa fila en la tabla `usuarios` con el resultado:
 *   UPDATE usuarios SET contra = 'EL_HASH_GENERADO' WHERE usuario = 'nombre_usuario';
 */

module.exports = router;
