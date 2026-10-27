const { json, method, verifyToken, writeAnalytics } = require('../_lib/common');
module.exports = async (req, res) => {
  if (!method(req, res, 'POST')) return;
  if (!verifyToken(req)) return json(res, 401, { error: 'unauthorized' });
  try { await writeAnalytics({ total: 0, byImage: {}, daily: {} }); return json(res, 200, { ok: true }); }
  catch { return json(res, 503, { error: 'analytics_storage_unavailable' }); }
};
