const { json, method, safeEqual, sign } = require('../_lib/common');
module.exports = (req, res) => {
  if (!method(req, res, 'POST')) return;
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !process.env.ADMIN_SESSION_SECRET) return json(res, 500, { error: 'admin_environment_not_configured' });
  const password = req.body && req.body.password;
  if (!safeEqual(password || '', expected)) return json(res, 401, { error: 'invalid' });
  try {
    const token = sign({ role: 'admin', exp: Date.now() + 30 * 60 * 1000 });
    return json(res, 200, { token, expiresIn: 1800 });
  } catch { return json(res, 500, { error: 'auth_configuration_error' }); }
};
