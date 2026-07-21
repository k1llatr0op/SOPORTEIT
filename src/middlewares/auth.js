// Ruta base desde variables de entorno
const BASE_PATH = process.env.BASE_PATH || '';

function requiereSesion(req, res, next) {
  if (!req.session?.usuario) return res.redirect(`${BASE_PATH}/login`);
  next();
}
function requiereAdmin(req, res, next) {
  const u = req.session?.usuario;
  if (!u || String(u.rol || '').toLowerCase() !== 'admin') {
    return res.status(403).render('errors/403', { title: 'Prohibido', basePath: BASE_PATH });
  }
  next();
}
module.exports = { requiereSesion, requiereAdmin };