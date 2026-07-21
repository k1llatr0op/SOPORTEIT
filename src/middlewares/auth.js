function requiereSesion(req, res, next) {
  if (!req.session?.usuario) return res.redirect('/login');
  next();
}
function requiereAdmin(req, res, next) {
  const u = req.session?.usuario;
  if (!u || String(u.rol || '').toLowerCase() !== 'admin') {
    return res.status(403).render('errors/403', { title: 'Prohibido' });
  }
  next();
}
module.exports = { requiereSesion, requiereAdmin };