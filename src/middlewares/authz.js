// Requiere sesión ya creada (usa tu requiereSesion antes)
function requiereAdmin(req, res, next) {
  const u = req.session?.usuario;
  if (u && String(u.rol || '').toUpperCase() === 'ADMIN') return next();
  return res.status(403).render('errors/403', { title: 'Prohibido' });
}

module.exports = { requiereAdmin };
